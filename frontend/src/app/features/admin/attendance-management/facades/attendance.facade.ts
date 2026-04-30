import {HttpErrorResponse} from '@angular/common/http';
import {inject, Injectable} from '@angular/core';
import {FormBuilder} from '@angular/forms';
import {ToastrService} from 'ngx-toastr';
import {
  BehaviorSubject,
  Observable,
  catchError,
  combineLatest,
  defer,
  distinctUntilChanged,
  finalize,
  map,
  of,
  shareReplay,
  switchMap,
  tap
} from 'rxjs';
import {AcademicClassService} from '../../academic-class-managment/services/academic-class.service';
import {CourseService} from '../../course-managment/services/course.service';
import {TeacherService} from '../../teacher-managment/services/teacher.service';
import {
  AttendanceFilters,
  AttendanceRecord,
  AttendanceSession,
  AttendanceStatus,
  StartAttendanceSessionRequest
} from '../models/attendance.model';
import {AttendanceApiService} from '../services/attendance-api.service';
import {AttendanceStateService} from '../services/attendance-state.service';

interface AttendanceCalendarCell {
  date: string;
  day: number;
  inCurrentMonth: boolean;
  isToday: boolean;
  count: number;
}

@Injectable()
export class AttendanceFacade {
  private readonly api = inject(AttendanceApiService);
  private readonly state = inject(AttendanceStateService);
  private readonly classService = inject(AcademicClassService);
  private readonly courseService = inject(CourseService);
  private readonly teacherService = inject(TeacherService);
  private readonly toastr = inject(ToastrService);
  private readonly fb = inject(FormBuilder);
  private readonly pendingRequestsSubject = new BehaviorSubject<number>(0);
  private readonly selectedSessionDateSubject = new BehaviorSubject<string | null>(null);
  private readonly calendarMonthSubject = new BehaviorSubject<Date>(this.startOfMonth(new Date()));
  private readonly availableSlotsRefreshSubject = new BehaviorSubject<number>(0);

  readonly weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  readonly filtersForm = this.fb.group({
    classId: this.fb.nonNullable.control(''),
    courseId: this.fb.nonNullable.control('')
  });

  readonly statusOptions: {value: AttendanceStatus; label: string; icon: string}[] = [
    {value: 'PRESENT', label: 'Present', icon: 'check_circle'},
    {value: 'ABSENT', label: 'Absent', icon: 'cancel'},
    {value: 'LATE', label: 'Late', icon: 'schedule'},
    {value: 'EXCUSED', label: 'Excused', icon: 'verified'}
  ];

  readonly sessions$ = this.state.sessions$;
  readonly currentSession$ = this.state.currentSession$;
  readonly selectedSessionDate$ = this.selectedSessionDateSubject.asObservable();
  readonly calendarMonth$ = this.calendarMonthSubject.asObservable();
  readonly calendarMonthLabel$ = this.calendarMonth$.pipe(
    map(month => month.toLocaleDateString('en-US', {month: 'long', year: 'numeric'}))
  );
  readonly sessionCount$ = this.sessions$.pipe(map(sessions => sessions.length));
  readonly calendarCells$ = combineLatest([this.sessions$, this.calendarMonth$]).pipe(
    map(([sessions, month]) => this.buildCalendarCells(sessions, month))
  );
  readonly visibleSessions$ = combineLatest([this.sessions$, this.selectedSessionDate$]).pipe(
    map(([sessions, selectedDate]) => this.filterSessionsByDate(sessions, selectedDate))
  );
  readonly visibleSessionCount$ = this.visibleSessions$.pipe(map(sessions => sessions.length));
  readonly sessionPreview$ = combineLatest([this.visibleSessions$, this.currentSession$]).pipe(
    map(([sessions, currentSession]) => this.buildSessionPreview(sessions, currentSession))
  );
  readonly records$ = this.state.records$;
  readonly localLoading$ = combineLatest([
    this.state.localLoading$,
    this.pendingRequestsSubject.pipe(map(count => count > 0), distinctUntilChanged())
  ]).pipe(map(([stateLoading, pending]) => stateLoading || pending));
  readonly stats$ = this.currentSession$.pipe(map(session => session?.summary ?? null));

  readonly classes$ = this.withLocalLoader(() => this.classService.getClasses(true))
    .pipe(catchError(() => of([])), shareReplay({bufferSize: 1, refCount: true}));
  readonly courses$ = this.withLocalLoader(() => this.courseService.getCourses(true))
    .pipe(catchError(() => of([])), shareReplay({bufferSize: 1, refCount: true}));
  readonly teachers$ = this.withLocalLoader(() => this.teacherService.getAllTeachers())
    .pipe(catchError(() => of([])), shareReplay({bufferSize: 1, refCount: true}));
  readonly availableSlots$ = this.availableSlotsRefreshSubject.pipe(
    switchMap(() => this.withLocalLoader(() => this.api.getAvailableSlots()).pipe(catchError(() => of([])))),
    shareReplay({bufferSize: 1, refCount: true})
  );

  readonly filteredRecords$ = combineLatest([this.records$, this.currentSession$]).pipe(
    map(([records]) => records)
  );

  constructor() {
    this.filtersForm.valueChanges.pipe(
      map(value => ({
        classId: value.classId ?? '',
        courseId: value.courseId ?? ''
      })),
      distinctUntilChanged((left, right) => JSON.stringify(left) === JSON.stringify(right))
    ).subscribe(filters => {
      this.state.setFilters(filters);
      this.loadSessions(filters);
    });
  }

  init(): void {
    this.loadSessions(this.filtersForm.getRawValue());
  }

  loadSessions(filters: AttendanceFilters = this.filtersForm.getRawValue()): void {
    this.withLocalLoader(() => this.api.getSessions(filters)).subscribe({
      next: sessions => {
        this.state.setSessions(sessions);
        const selectedDate = this.resolveSelectedDate(sessions);
        const visibleSessions = this.filterSessionsByDate(sessions, selectedDate);
        const currentId = this.state.snapshot.currentSession?.id;
        const currentStillVisible = visibleSessions.some(session => session.id === currentId);
        if (visibleSessions.length > 0 && !currentStillVisible) {
          this.loadSessionDetails(visibleSessions[0].id);
          return;
        }
        if (visibleSessions.length === 0) {
          this.state.setCurrentSession(null);
          this.state.setRecords([]);
        }
      },
      error: () => this.toastr.error('Unable to load attendance sessions.')
    });
  }

  loadSessionDetails(id: number): void {
    this.withLocalLoader(() => this.api.getSessionDetails(id)).subscribe({
      next: details => this.state.applyDetails(details.session, details.records),
      error: () => this.toastr.error('Unable to load session details.')
    });
  }

  startSession(request: StartAttendanceSessionRequest): void {
    this.withLocalLoader(() => this.api.startSession(request)).subscribe({
      next: details => {
        this.state.applyDetails(details.session, details.records);
        this.refreshAvailableSlots();
        this.toastr.success('Attendance session started.');
      },
      error: error => this.handleError(error, 'Unable to start attendance session.')
    });
  }

  refreshAvailableSlots(): void {
    this.availableSlotsRefreshSubject.next(Date.now());
  }

  updateStudentStatus(record: AttendanceRecord, status: AttendanceStatus): void {
    this.withLocalLoader(() => this.api.updateStudentStatus(record.id, {status, note: record.note})).subscribe({
      next: details => this.state.applyDetails(details.session, details.records),
      error: error => this.handleError(error, 'Unable to update attendance status.')
    });
  }

  closeSession(id: number): void {
    if (!confirm('Close this attendance session?')) return;
    this.withLocalLoader(() => this.api.closeSession(id)).subscribe({
      next: details => {
        this.state.applyDetails(details.session, details.records);
        this.toastr.success('Attendance session closed.');
      },
      error: error => this.handleError(error, 'Unable to close attendance session.')
    });
  }

  selectSessionDate(date: string | null): void {
    this.selectedSessionDateSubject.next(date);
    if (date) {
      this.calendarMonthSubject.next(this.startOfMonth(new Date(`${date}T00:00:00`)));
    }
    const visibleSessions = this.filterSessionsByDate(this.state.snapshot.sessions, date);
    const currentId = this.state.snapshot.currentSession?.id;
    if (visibleSessions.some(session => session.id === currentId)) return;
    if (visibleSessions.length > 0) {
      this.loadSessionDetails(visibleSessions[0].id);
      return;
    }
    this.state.setCurrentSession(null);
    this.state.setRecords([]);
  }

  previousCalendarMonth(): void {
    this.calendarMonthSubject.next(this.addMonths(this.calendarMonthSubject.value, -1));
  }

  nextCalendarMonth(): void {
    this.calendarMonthSubject.next(this.addMonths(this.calendarMonthSubject.value, 1));
  }

  goToToday(): void {
    this.calendarMonthSubject.next(this.startOfMonth(new Date()));
  }

  private withLocalLoader<T>(requestFactory: () => Observable<T>): Observable<T> {
    return defer(() => {
      this.pendingRequestsSubject.next(this.pendingRequestsSubject.value + 1);
      return requestFactory().pipe(
        tap(() => this.state.setLocalLoading(false)),
        finalize(() => this.pendingRequestsSubject.next(Math.max(0, this.pendingRequestsSubject.value - 1)))
      );
    });
  }

  private handleError(error: unknown, fallback: string): void {
    if (error instanceof HttpErrorResponse && typeof error.error === 'string') {
      this.toastr.error(error.error);
      return;
    }
    this.toastr.error(fallback);
  }

  private buildSessionPreview(sessions: AttendanceSession[], currentSession: AttendanceSession | null): AttendanceSession[] {
    const ordered = currentSession
      ? [currentSession, ...sessions.filter(session => session.id !== currentSession.id)]
      : sessions;
    return ordered.slice(0, 5);
  }

  private buildCalendarCells(sessions: AttendanceSession[], month: Date): AttendanceCalendarCell[] {
    const counts = sessions.reduce((acc, session) => {
      acc.set(session.sessionDate, (acc.get(session.sessionDate) ?? 0) + 1);
      return acc;
    }, new Map<string, number>());

    const firstDay = this.startOfMonth(month);
    const gridStart = new Date(firstDay);
    gridStart.setDate(firstDay.getDate() - firstDay.getDay());
    const todayKey = this.toDateKey(new Date());

    return Array.from({length: 42}, (_, index) => {
      const value = new Date(gridStart);
      value.setDate(gridStart.getDate() + index);
      const date = this.toDateKey(value);
      return {
        date,
        day: value.getDate(),
        inCurrentMonth: value.getMonth() === month.getMonth(),
        isToday: date === todayKey,
        count: counts.get(date) ?? 0
      };
    });
  }

  private filterSessionsByDate(sessions: AttendanceSession[], selectedDate: string | null): AttendanceSession[] {
    return selectedDate ? sessions.filter(session => session.sessionDate === selectedDate) : sessions;
  }

  private resolveSelectedDate(sessions: AttendanceSession[]): string | null {
    const selectedDate = this.selectedSessionDateSubject.value;
    if (!selectedDate || sessions.some(session => session.sessionDate === selectedDate)) {
      return selectedDate;
    }
    this.selectedSessionDateSubject.next(null);
    return null;
  }

  private startOfMonth(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), 1);
  }

  private addMonths(date: Date, months: number): Date {
    return new Date(date.getFullYear(), date.getMonth() + months, 1);
  }

  private toDateKey(date: Date): string {
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const day = `${date.getDate()}`.padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

}
