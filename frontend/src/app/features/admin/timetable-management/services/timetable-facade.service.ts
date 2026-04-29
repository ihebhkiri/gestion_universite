import {HttpErrorResponse} from '@angular/common/http';
import {inject, Injectable, OnDestroy} from '@angular/core';
import {FormBuilder, Validators} from '@angular/forms';
import {ToastrService} from 'ngx-toastr';
import {
  BehaviorSubject,
  Observable,
  Subject,
  catchError,
  combineLatest,
  debounceTime,
  defer,
  distinctUntilChanged,
  finalize,
  map,
  of,
  shareReplay,
  startWith,
  switchMap,
  takeUntil,
  tap
} from 'rxjs';
import {AcademicClassService} from '../../academic-class-managment/services/academic-class.service';
import {CourseService} from '../../course-managment/services/course.service';
import {SemesterService} from '../../semester-managment/services/semester.service';
import {TeacherService} from '../../teacher-managment/services/teacher.service';
import {
  CourseSessionType,
  TimetableDay,
  TimetableEntryForm,
  TimetableEntryRequest,
  TimetableEntryResponse,
  TimetableFilterForm,
  TimetableFilters
} from '../models/timetable.model';
import {RoomService} from './room.service';
import {TimetableService} from './timetable.service';

const EMPTY_FILTERS: TimetableFilters = {
  classId: '',
  semesterId: ''
};

@Injectable()
export class TimetableFacadeService implements OnDestroy {
  readonly days: { value: TimetableDay; label: string }[] = [
    {value: 'MONDAY', label: 'Monday'},
    {value: 'TUESDAY', label: 'Tuesday'},
    {value: 'WEDNESDAY', label: 'Wednesday'},
    {value: 'THURSDAY', label: 'Thursday'},
    {value: 'FRIDAY', label: 'Friday'},
    {value: 'SATURDAY', label: 'Saturday'}
  ];
  readonly sessionTypes: CourseSessionType[] = ['CM', 'TD', 'TP'];

  private readonly fb = inject(FormBuilder);
  private readonly timetableService = inject(TimetableService);
  private readonly classService = inject(AcademicClassService);
  private readonly semesterService = inject(SemesterService);
  private readonly courseService = inject(CourseService);
  private readonly teacherService = inject(TeacherService);
  private readonly roomService = inject(RoomService);
  private readonly toastr = inject(ToastrService);

  private readonly destroy$ = new Subject<void>();
  private readonly filtersSubject = new BehaviorSubject<TimetableFilters>(EMPTY_FILTERS);
  private readonly refreshSubject = new BehaviorSubject<number>(0);
  private readonly pendingRequestsSubject = new BehaviorSubject<number>(0);
  private readonly savingSubject = new BehaviorSubject<boolean>(false);
  private readonly dialogOpenSubject = new BehaviorSubject<boolean>(false);
  private readonly editingEntrySubject = new BehaviorSubject<TimetableEntryResponse | null>(null);
  private readonly errorSubject = new BehaviorSubject<string | null>(null);

  readonly filtersForm = this.fb.group<TimetableFilterForm>({
    classId: this.fb.nonNullable.control(''),
    semesterId: this.fb.nonNullable.control('')
  });

  readonly entryForm = this.fb.group<TimetableEntryForm>({
    id: this.fb.control<number | null>(null),
    dayOfWeek: this.fb.nonNullable.control<TimetableDay>('MONDAY', {validators: [Validators.required]}),
    startTime: this.fb.nonNullable.control('08:00', {validators: [Validators.required]}),
    endTime: this.fb.nonNullable.control('10:00', {validators: [Validators.required]}),
    courseId: this.fb.nonNullable.control('', {validators: [Validators.required]}),
    teacherId: this.fb.nonNullable.control('', {validators: [Validators.required]}),
    roomId: this.fb.nonNullable.control('', {validators: [Validators.required]}),
    academicClassId: this.fb.nonNullable.control('', {validators: [Validators.required]}),
    semesterId: this.fb.nonNullable.control('', {validators: [Validators.required]}),
    sessionType: this.fb.nonNullable.control<CourseSessionType>('CM', {validators: [Validators.required]})
  });

  readonly loading$ = this.pendingRequestsSubject.pipe(
    map(count => count > 0),
    distinctUntilChanged()
  );
  readonly saving$ = this.savingSubject.asObservable();
  readonly dialogOpen$ = this.dialogOpenSubject.asObservable();
  readonly editingEntry$ = this.editingEntrySubject.asObservable();
  readonly error$ = this.errorSubject.asObservable();
  readonly filters$ = this.filtersSubject.asObservable();

  readonly classes$ = this.withLocalLoader(() => this.classService.getClasses(true))
    .pipe(catchError(() => of([])), shareReplay({bufferSize: 1, refCount: true}));
  readonly semesters$ = this.withLocalLoader(() => this.semesterService.getSemesters(true))
    .pipe(catchError(() => of([])), shareReplay({bufferSize: 1, refCount: true}));
  readonly courses$ = this.withLocalLoader(() => this.courseService.getCourses(true))
    .pipe(catchError(() => of([])), shareReplay({bufferSize: 1, refCount: true}));
  readonly teachers$ = this.withLocalLoader(() => this.teacherService.getAllTeachers())
    .pipe(catchError(() => of([])), shareReplay({bufferSize: 1, refCount: true}));
  readonly rooms$ = this.withLocalLoader(() => this.roomService.getRooms())
    .pipe(catchError(() => of([])), shareReplay({bufferSize: 1, refCount: true}));

  readonly entries$ = combineLatest([
    this.filtersSubject.pipe(distinctUntilChanged(this.sameJson)),
    this.refreshSubject
  ]).pipe(
    tap(() => {
      this.errorSubject.next(null);
    }),
    switchMap(([filters]) => this.withLocalLoader(() => this.timetableService.getEntries(filters)).pipe(
      catchError(() => {
        this.errorSubject.next('Unable to load timetable entries.');
        return of([]);
      })
    )),
    shareReplay({bufferSize: 1, refCount: true})
  );

  readonly selectedClassLabel$ = combineLatest([this.classes$, this.filters$]).pipe(
    map(([classes, filters]) => classes.find(item => item.id.toString() === filters.classId)?.code ?? 'All classes')
  );

  constructor() {
    this.filtersForm.valueChanges.pipe(
      startWith(this.filtersForm.getRawValue()),
      debounceTime(200),
      map(value => ({
        classId: value.classId ?? '',
        semesterId: value.semesterId ?? ''
      })),
      distinctUntilChanged(this.sameJson),
      takeUntil(this.destroy$)
    ).subscribe(filters => this.filtersSubject.next(filters));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  refresh(): void {
    this.refreshSubject.next(Date.now());
  }

  resetFilters(): void {
    this.filtersForm.reset(EMPTY_FILTERS);
  }

  openCreate(dayOfWeek: TimetableDay = 'MONDAY', startTime = '08:00'): void {
    const filters = this.filtersSubject.value;
    this.entryForm.reset({
      id: null,
      dayOfWeek,
      startTime,
      endTime: this.addHours(startTime, 2),
      courseId: '',
      teacherId: '',
      roomId: '',
      academicClassId: filters.classId,
      semesterId: filters.semesterId,
      sessionType: 'CM'
    });
    this.editingEntrySubject.next(null);
    this.dialogOpenSubject.next(true);
  }

  openEdit(entry: TimetableEntryResponse): void {
    this.entryForm.reset({
      id: entry.id,
      dayOfWeek: entry.dayOfWeek,
      startTime: this.toInputTime(entry.startTime),
      endTime: this.toInputTime(entry.endTime),
      courseId: entry.courseId?.toString() ?? '',
      teacherId: entry.teacherId?.toString() ?? '',
      roomId: entry.roomId?.toString() ?? '',
      academicClassId: entry.academicClassId?.toString() ?? '',
      semesterId: entry.semesterId?.toString() ?? '',
      sessionType: entry.sessionType
    });
    this.editingEntrySubject.next(entry);
    this.dialogOpenSubject.next(true);
  }

  closeDialog(): void {
    this.dialogOpenSubject.next(false);
    this.editingEntrySubject.next(null);
  }

  saveEntry(): void {
    if (this.entryForm.invalid) {
      this.entryForm.markAllAsTouched();
      this.toastr.warning('Please complete all required fields.');
      return;
    }

    const value = this.entryForm.getRawValue();
    if (value.endTime <= value.startTime) {
      this.toastr.warning('End time must be after start time.');
      return;
    }

    this.savingSubject.next(true);
    const request = this.toRequest(value);

    this.withLocalLoader(() => value.id
      ? this.timetableService.update(value.id, request)
      : this.timetableService.create(request)
    ).pipe(finalize(() => this.savingSubject.next(false))).subscribe({
      next: () => {
        this.toastr.success(value.id ? 'Timetable entry updated.' : 'Timetable entry added.');
        this.closeDialog();
        this.refresh();
      },
      error: error => this.handleSaveError(error)
    });
  }

  deleteEntry(entry: TimetableEntryResponse): void {
    if (!confirm(`Delete
    ${entry.courseCode} from the timetable?`)) return;
    this.withLocalLoader(() => this.timetableService.delete(entry.id)).subscribe({
      next: () => {
        this.toastr.success('Timetable entry deleted.');
        this.refresh();
      },
      error: () => this.toastr.error('Unable to delete this timetable entry.')
    });
  }

  badgeClass(type: CourseSessionType): string {
    const classes: Record<CourseSessionType, string> = {
      CM: 'timetable-badge timetable-badge-cm',
      TD: 'timetable-badge timetable-badge-td',
      TP: 'timetable-badge timetable-badge-tp'
    };
    return classes[type];
  }

  private toRequest(value: ReturnType<typeof this.entryForm.getRawValue>): TimetableEntryRequest {
    return {
      dayOfWeek: value.dayOfWeek,
      startTime: value.startTime,
      endTime: value.endTime,
      courseId: Number(value.courseId),
      teacherId: Number(value.teacherId),
      roomId: Number(value.roomId),
      academicClassId: Number(value.academicClassId),
      semesterId: Number(value.semesterId),
      sessionType: value.sessionType
    };
  }

  private handleSaveError(error: unknown): void {
    if (error instanceof HttpErrorResponse && error.status === 409) {
      this.toastr.error(typeof error.error === 'string' ? error.error : 'Schedule conflict detected.');
      return;
    }
    this.toastr.error('Unable to save timetable entry.');
  }

  private toInputTime(value: string): string {
    return value?.slice(0, 5) ?? '';
  }

  private addHours(value: string, hours: number): string {
    const [rawHour, rawMinute] = value.split(':').map(Number);
    const nextHour = Math.min((rawHour || 0) + hours, 23);
    const minute = rawMinute || 0;
    return `${nextHour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  }

  private withLocalLoader<T>(requestFactory: () => Observable<T>): Observable<T> {
    return defer(() => {
      this.pendingRequestsSubject.next(this.pendingRequestsSubject.value + 1);
      return requestFactory().pipe(finalize(() => this.decrementPendingRequests()));
    });
  }

  private decrementPendingRequests(): void {
    this.pendingRequestsSubject.next(Math.max(0, this.pendingRequestsSubject.value - 1));
  }

  private sameJson<T>(left: T, right: T): boolean {
    return JSON.stringify(left) === JSON.stringify(right);
  }
}
