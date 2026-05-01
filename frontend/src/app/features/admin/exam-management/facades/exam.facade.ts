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
  forkJoin,
  finalize,
  map,
  of,
  takeUntil,
  tap
} from 'rxjs';
import {
  EXAM_SESSION_TYPES,
  EXAM_STATUSES,
  EXAM_TYPES,
  ExamConflict,
  ExamDialogForm,
  ExamFilterForm,
  ExamFilters,
  ExamOption,
  ExamRequest,
  ExamResponse,
  ExamSessionType,
  ExamStatus,
  ExamType,
  ExamSummary,
  ExamConflictCheckRequest
} from '../models/exam.model';
import {AcademicClassService} from '../../academic-class-managment/services/academic-class.service';
import {CourseService} from '../../course-managment/services/course.service';
import {RoomService} from '../../room-management/services/room.service';
import {ROOM_TYPES} from '../../room-management/models/room.model';
import {SemesterService} from '../../semester-managment/services/semester.service';
import {GroupService} from '../../student-managment/services/group.service';
import {TeacherService} from '../../teacher-managment/services/teacher.service';
import {ExamApiService} from '../services/exam-api.service';
import {EMPTY_EXAM_FILTERS, ExamStateService} from '../services/exam-state.service';

interface ExamDialogValue {
  id: number | null;
  title: string;
  courseId: string;
  classId: string;
  groupId: string;
  roomId: string;
  supervisorId: string;
  semesterId: string;
  examDate: string;
  startTime: string;
  endTime: string;
  type: ExamType;
  sessionType: ExamSessionType | '';
  status: ExamStatus;
  duration: number | null;
  weight: number | null;
  instructions: string;
}

@Injectable()
export class ExamFacade implements OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(ExamApiService);
  private readonly state = inject(ExamStateService);
  private readonly toastr = inject(ToastrService);
  private readonly academicClassService = inject(AcademicClassService);
  private readonly courseService = inject(CourseService);
  private readonly groupService = inject(GroupService);
  private readonly roomService = inject(RoomService);
  private readonly semesterService = inject(SemesterService);
  private readonly teacherService = inject(TeacherService);
  private readonly destroy$ = new Subject<void>();
  private readonly pendingRequestsSubject = new BehaviorSubject<number>(0);
  private readonly dialogOpenSubject = new BehaviorSubject<boolean>(false);
  private readonly coursesSubject = new BehaviorSubject<ExamOption[]>([]);
  private readonly classesSubject = new BehaviorSubject<ExamOption[]>([]);
  private readonly groupsSubject = new BehaviorSubject<ExamOption[]>([]);
  private readonly roomsSubject = new BehaviorSubject<ExamOption[]>([]);
  private readonly teachersSubject = new BehaviorSubject<ExamOption[]>([]);
  private readonly semestersSubject = new BehaviorSubject<ExamOption[]>([]);
  private readonly academicYearsSubject = new BehaviorSubject<ExamOption[]>([]);

  readonly examTypes = EXAM_TYPES;
  readonly examStatuses = EXAM_STATUSES;
  readonly examSessionTypes = EXAM_SESSION_TYPES;
  readonly roomTypes = ROOM_TYPES;

  readonly filtersForm = this.fb.group<ExamFilterForm>({
    academicYearId: this.fb.nonNullable.control(''),
    semesterId: this.fb.nonNullable.control(''),
    courseId: this.fb.nonNullable.control(''),
    classId: this.fb.nonNullable.control(''),
    groupId: this.fb.nonNullable.control(''),
    roomId: this.fb.nonNullable.control(''),
    supervisorId: this.fb.nonNullable.control(''),
    date: this.fb.nonNullable.control(''),
    status: this.fb.nonNullable.control<ExamStatus | ''>('')
  });

  readonly examForm = this.fb.group<ExamDialogForm>({
    id: this.fb.control<number | null>(null),
    title: this.fb.nonNullable.control('', [Validators.required, Validators.maxLength(120)]),
    courseId: this.fb.nonNullable.control('', Validators.required),
    classId: this.fb.nonNullable.control('', Validators.required),
    groupId: this.fb.nonNullable.control(''),
    roomId: this.fb.nonNullable.control('', Validators.required),
    supervisorId: this.fb.nonNullable.control('', Validators.required),
    semesterId: this.fb.nonNullable.control('', Validators.required),
    examDate: this.fb.nonNullable.control('', Validators.required),
    startTime: this.fb.nonNullable.control('', Validators.required),
    endTime: this.fb.nonNullable.control('', Validators.required),
    type: this.fb.nonNullable.control<ExamType>('EXAM', Validators.required),
    sessionType: this.fb.nonNullable.control<ExamSessionType | ''>('MAIN'),
    status: this.fb.nonNullable.control<ExamStatus>('PLANNED', Validators.required),
    duration: this.fb.control<number | null>(null),
    weight: this.fb.control<number | null>(null),
    instructions: this.fb.nonNullable.control('', Validators.maxLength(1000))
  });

  readonly exams$ = this.state.exams$;
  readonly selectedExam$ = this.state.selectedExam$;
  readonly selectedDate$ = this.state.selectedDate$;
  readonly summary$ = this.state.summary$;
  readonly conflicts$ = this.state.conflicts$;
  readonly dialogOpen$ = this.dialogOpenSubject.asObservable();
  readonly courses$ = this.coursesSubject.asObservable();
  readonly classes$ = this.classesSubject.asObservable();
  readonly groups$ = this.groupsSubject.asObservable();
  readonly rooms$ = this.roomsSubject.asObservable();
  readonly teachers$ = this.teachersSubject.asObservable();
  readonly semesters$ = this.semestersSubject.asObservable();
  readonly academicYears$ = this.academicYearsSubject.asObservable();
  readonly dayExams$ = combineLatest([this.exams$, this.selectedDate$]).pipe(
    map(([exams, selectedDate]) => selectedDate
      ? exams.filter(exam => exam.examDate === selectedDate)
      : exams
    )
  );
  readonly localLoading$ = combineLatest([
    this.state.localLoading$,
    this.pendingRequestsSubject.pipe(map(count => count > 0), distinctUntilChanged())
  ]).pipe(map(([stateLoading, pending]) => stateLoading || pending));

  constructor() {
    this.filtersForm.valueChanges.pipe(
      debounceTime(300),
      map(value => this.normalizeFilters(value as ExamFilters)),
      distinctUntilChanged(this.sameJson),
      takeUntil(this.destroy$)
    ).subscribe(filters => {
      this.state.setFilters(filters);
      this.loadExams(filters);
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadExams(filters: ExamFilters = this.normalizeFilters(this.filtersForm.getRawValue())): void {
    this.withLocalLoader(() => this.api.getExams(filters)).subscribe({
      next: exams => {
        this.state.setExams(exams);
        this.state.setSummary(this.buildSummary(exams, this.state.snapshot.conflicts));
        this.syncSelectedExam(exams);
      },
      error: error => this.handleError(error, 'Unable to load exams.')
    });
  }

  refresh(): void {
    this.loadExams(this.normalizeFilters(this.filtersForm.getRawValue()));
  }

  loadReferenceData(): void {
    const emptyRoomFilters = {search: '', building: '', location: '', type: ''};

    this.withLocalLoader(() => forkJoin({
      courses: this.courseService.getCourses(true).pipe(catchError(() => of([]))),
      classes: this.academicClassService.getClasses(true).pipe(catchError(() => of([]))),
      groups: this.groupService.getGroups(true).pipe(catchError(() => of([]))),
      rooms: this.roomService.getRooms(emptyRoomFilters, 0, 250).pipe(
        map(response => response.content),
        catchError(() => of([]))
      ),
      teachers: this.teacherService.getAllTeachers().pipe(catchError(() => of([]))),
      semesters: this.semesterService.getSemesters(true).pipe(catchError(() => of([]))),
      academicYears: this.semesterService.getAcademicYears().pipe(catchError(() => of([])))
    })).subscribe({
      next: refs => {
        this.coursesSubject.next(refs.courses.map(course => ({
          id: course.id,
          label: `${course.code} - ${course.title}`,
          meta: `${course.credits} credits`
        })));
        this.classesSubject.next(refs.classes.map(academicClass => ({
          id: academicClass.id,
          label: academicClass.code,
          meta: academicClass.academicYearLabel
        })));
        this.groupsSubject.next(refs.groups.map(group => ({
          id: group.id,
          label: group.name,
          meta: group.classCode
        })));
        this.roomsSubject.next(refs.rooms.map(room => ({
          id: room.id,
          label: `${room.code} - ${room.name}`,
          meta: `${room.capacity} seats`
        })));
        this.teachersSubject.next(refs.teachers.map(teacher => ({
          id: teacher.id,
          label: teacher.fullName || `${teacher.firstName} ${teacher.lastName}`.trim() || teacher.matricule,
          meta: teacher.grade ?? teacher.matricule
        })));
        this.semestersSubject.next(refs.semesters.map(semester => ({
          id: semester.id,
          label: semester.name,
          meta: semester.academicYearLabel
        })));
        this.academicYearsSubject.next(refs.academicYears.map(year => ({
          id: year.id,
          label: year.label,
          meta: year.active ? 'Active' : undefined
        })));
      },
      error: error => this.handleError(error, 'Unable to load exam reference data.')
    });
  }

  selectExam(exam: ExamResponse | number | null): void {
    if (exam === null) {
      this.state.setSelectedExam(null);
      return;
    }

    if (typeof exam !== 'number') {
      this.state.setSelectedExam(exam);
      return;
    }

    const localExam = this.state.snapshot.exams.find(item => item.id === exam);
    if (localExam) {
      this.state.setSelectedExam(localExam);
      return;
    }

    this.withLocalLoader(() => this.api.getExam(exam)).subscribe({
      next: selectedExam => this.state.setSelectedExam(selectedExam),
      error: error => this.handleError(error, 'Unable to load exam details.')
    });
  }

  selectDate(date: string | null): void {
    this.state.setSelectedDate(date);
    const dayExams = this.filterExamsByDate(this.state.snapshot.exams, date);
    const currentId = this.state.snapshot.selectedExam?.id;
    if (dayExams.some(exam => exam.id === currentId)) return;
    this.state.setSelectedExam(dayExams[0] ?? null);
  }

  openCreate(date: string | null = this.state.snapshot.selectedDate): void {
    this.state.setConflicts([]);
    this.examForm.reset({
      id: null,
      title: '',
      courseId: '',
      classId: '',
      groupId: '',
      roomId: '',
      supervisorId: '',
      semesterId: '',
      examDate: date ?? this.toDateKey(new Date()),
      startTime: '09:00',
      endTime: '10:30',
      type: 'EXAM',
      sessionType: 'MAIN',
      status: 'PLANNED',
      duration: 1.5,
      weight: null,
      instructions: ''
    });
    this.dialogOpenSubject.next(true);
  }

  openEdit(exam: ExamResponse): void {
    this.state.setConflicts([]);
    this.state.setSelectedExam(exam);
    this.examForm.reset({
      id: exam.id,
      title: exam.title,
      courseId: this.toControlValue(exam.courseId),
      classId: this.toControlValue(exam.classId),
      groupId: this.toControlValue(exam.groupId),
      roomId: this.toControlValue(exam.roomId),
      supervisorId: this.toControlValue(exam.supervisorId),
      semesterId: this.toControlValue(exam.semesterId),
      examDate: exam.examDate ?? this.toDateKey(new Date()),
      startTime: this.toShortTime(exam.startTime) || '09:00',
      endTime: this.toShortTime(exam.endTime) || '10:30',
      type: exam.type,
      sessionType: exam.sessionType ?? 'MAIN',
      status: exam.status,
      duration: exam.duration,
      weight: exam.weight,
      instructions: exam.instructions ?? ''
    });
    this.dialogOpenSubject.next(true);
  }

  closeDialog(): void {
    this.dialogOpenSubject.next(false);
    this.state.setConflicts([]);
  }

  saveDialog(): void {
    if (this.examForm.invalid) {
      this.examForm.markAllAsTouched();
      this.toastr.warning('Please complete all required exam fields.');
      return;
    }

    const value = this.examForm.getRawValue();
    if (value.endTime <= value.startTime) {
      this.toastr.warning('End time must be after start time.');
      return;
    }

    const request = this.buildExamRequest(value);
    const id = value.id;

    if (id) {
      this.withLocalLoader(() => this.api.updateExam(id, request)).subscribe({
        next: exam => {
          this.state.upsertExam(exam);
          this.state.setSummary(this.buildSummary(this.state.snapshot.exams, this.state.snapshot.conflicts));
          this.toastr.success('Exam updated.');
          this.closeDialog();
        },
        error: error => this.handleError(error, 'Unable to update exam.')
      });
      return;
    }

    this.withLocalLoader(() => this.api.createExam(request)).subscribe({
      next: exam => {
        this.state.upsertExam(exam);
        this.state.setSummary(this.buildSummary(this.state.snapshot.exams, this.state.snapshot.conflicts));
        this.toastr.success('Exam created.');
        this.closeDialog();
      },
      error: error => this.handleError(error, 'Unable to create exam.')
    });
  }

  createExam(request: ExamRequest): void {
    this.withLocalLoader(() => this.api.createExam(request)).subscribe({
      next: exam => {
        this.state.upsertExam(exam);
        this.state.setSummary(this.buildSummary(this.state.snapshot.exams, this.state.snapshot.conflicts));
        this.toastr.success('Exam created.');
      },
      error: error => this.handleError(error, 'Unable to create exam.')
    });
  }

  updateExam(id: number, request: ExamRequest): void {
    this.withLocalLoader(() => this.api.updateExam(id, request)).subscribe({
      next: exam => {
        this.state.upsertExam(exam);
        this.state.setSummary(this.buildSummary(this.state.snapshot.exams, this.state.snapshot.conflicts));
        this.toastr.success('Exam updated.');
      },
      error: error => this.handleError(error, 'Unable to update exam.')
    });
  }

  deleteExam(exam: ExamResponse): void {
    if (!confirm(`Delete "${exam.title}"?`)) return;

    this.withLocalLoader(() => this.api.deleteExam(exam.id)).subscribe({
      next: () => {
        const exams = this.state.snapshot.exams.filter(item => item.id !== exam.id);
        this.state.setExams(exams);
        this.state.setSelectedExam(exams[0] ?? null);
        this.state.setSummary(this.buildSummary(exams, this.state.snapshot.conflicts));
        this.toastr.success('Exam deleted.');
      },
      error: error => this.handleError(error, 'Unable to delete exam.')
    });
  }

  cancelExam(id: number): void {
    if (!confirm('Cancel this exam?')) return;

    this.withLocalLoader(() => this.api.cancelExam(id)).subscribe({
      next: exam => {
        this.state.upsertExam(exam);
        this.state.setSummary(this.buildSummary(this.state.snapshot.exams, this.state.snapshot.conflicts));
        this.toastr.success('Exam cancelled.');
      },
      error: error => this.handleError(error, 'Unable to cancel exam.')
    });
  }

  changeStatus(id: number, status: ExamStatus): void {
    this.withLocalLoader(() => this.api.changeStatus(id, status)).subscribe({
      next: exam => {
        this.state.upsertExam(exam);
        this.state.setSummary(this.buildSummary(this.state.snapshot.exams, this.state.snapshot.conflicts));
        this.toastr.success('Exam status updated.');
      },
      error: error => this.handleError(error, 'Unable to change exam status.')
    });
  }

  requestConflictCheck(): void {
    const request = this.buildConflictCheckRequest();
    if (!request) {
      this.toastr.warning('Select a date, start time and end time before checking conflicts.');
      return;
    }
    this.checkConflicts(request);
  }

  checkConflicts(request: ExamConflictCheckRequest): void {
    this.withLocalLoader(() => this.api.checkConflicts(request)).subscribe({
      next: conflicts => {
        this.state.setConflicts(conflicts);
        this.state.setSummary(this.buildSummary(this.state.snapshot.exams, conflicts));
        if (conflicts.length === 0) {
          this.toastr.success('No exam conflicts found.');
        }
      },
      error: error => this.handleError(error, 'Unable to check exam conflicts.')
    });
  }

  resetFilters(): void {
    this.filtersForm.reset(EMPTY_EXAM_FILTERS);
    this.selectDate(null);
  }

  private withLocalLoader<T>(requestFactory: () => Observable<T>): Observable<T> {
    return defer(() => {
      this.pendingRequestsSubject.next(this.pendingRequestsSubject.value + 1);
      this.state.setLocalLoading(true);
      return requestFactory().pipe(
        tap(() => this.state.setLocalLoading(false)),
        finalize(() => {
          this.pendingRequestsSubject.next(Math.max(0, this.pendingRequestsSubject.value - 1));
          if (this.pendingRequestsSubject.value === 0) {
            this.state.setLocalLoading(false);
          }
        })
      );
    });
  }

  private syncSelectedExam(exams: ExamResponse[]): void {
    const selectedId = this.state.snapshot.selectedExam?.id;
    const selectedExam = selectedId ? exams.find(exam => exam.id === selectedId) : null;
    this.state.setSelectedExam(selectedExam ?? exams[0] ?? null);
  }

  private normalizeFilters(value: ExamFilters): ExamFilters {
    return {
      academicYearId: value.academicYearId?.trim() ?? '',
      semesterId: value.semesterId?.trim() ?? '',
      courseId: value.courseId?.trim() ?? '',
      classId: value.classId?.trim() ?? '',
      groupId: value.groupId?.trim() ?? '',
      roomId: value.roomId?.trim() ?? '',
      supervisorId: value.supervisorId?.trim() ?? '',
      date: value.date ?? '',
      status: value.status ?? ''
    };
  }

  private filterExamsByDate(exams: ExamResponse[], selectedDate: string | null): ExamResponse[] {
    return selectedDate ? exams.filter(exam => exam.examDate === selectedDate) : exams;
  }

  private buildExamRequest(value: ExamDialogValue): ExamRequest {
    return {
      title: value.title.trim(),
      courseId: Number(value.courseId),
      classId: Number(value.classId),
      groupId: this.optionalNumber(value.groupId),
      roomId: Number(value.roomId),
      supervisorId: Number(value.supervisorId),
      semesterId: Number(value.semesterId),
      examDate: value.examDate,
      startTime: value.startTime,
      endTime: value.endTime,
      type: value.type,
      sessionType: value.sessionType || null,
      status: value.status,
      duration: value.duration,
      weight: value.weight,
      instructions: value.instructions.trim() || null
    };
  }

  private buildConflictCheckRequest(): ExamConflictCheckRequest | null {
    const value = this.examForm.getRawValue();
    if (!value.examDate || !value.startTime || !value.endTime) {
      const selected = this.state.snapshot.selectedExam;
      if (!selected?.examDate || !selected.startTime || !selected.endTime) return null;

      return {
        examId: selected.id,
        examDate: selected.examDate,
        startTime: this.toShortTime(selected.startTime),
        endTime: this.toShortTime(selected.endTime),
        roomId: selected.roomId,
        classId: selected.classId,
        groupId: selected.groupId,
        supervisorId: selected.supervisorId
      };
    }

    return {
      examId: value.id,
      examDate: value.examDate,
      startTime: value.startTime,
      endTime: value.endTime,
      roomId: this.optionalNumber(value.roomId),
      classId: this.optionalNumber(value.classId),
      groupId: this.optionalNumber(value.groupId),
      supervisorId: this.optionalNumber(value.supervisorId)
    };
  }

  private optionalNumber(value: string | number | null | undefined): number | null {
    if (value === null || value === undefined || value === '') return null;
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric : null;
  }

  private toControlValue(value: number | null | undefined): string {
    return value === null || value === undefined ? '' : `${value}`;
  }

  private toShortTime(value: string | null): string {
    return value ? value.slice(0, 5) : '';
  }

  private buildSummary(exams: ExamResponse[], conflicts: ExamConflict[]): ExamSummary {
    const today = this.toDateKey(new Date());
    const usedRooms = new Set(exams.map(exam => exam.roomId).filter((roomId): roomId is number => roomId !== null));

    return {
      totalExams: exams.length,
      upcomingExams: exams.filter(exam => !!exam.examDate && exam.examDate >= today).length,
      todayExams: exams.filter(exam => exam.examDate === today).length,
      usedRooms: usedRooms.size,
      plannedExams: exams.filter(exam => exam.status === 'PLANNED').length,
      inProgressExams: exams.filter(exam => exam.status === 'IN_PROGRESS').length,
      completedExams: exams.filter(exam => exam.status === 'COMPLETED').length,
      cancelledExams: exams.filter(exam => exam.status === 'CANCELLED').length,
      conflicts: conflicts.length
    };
  }

  private toDateKey(date: Date): string {
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const day = `${date.getDate()}`.padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private sameJson<T>(left: T, right: T): boolean {
    return JSON.stringify(left) === JSON.stringify(right);
  }

  private handleError(error: unknown, fallback: string): void {
    if (error instanceof HttpErrorResponse && typeof error.error === 'string') {
      this.toastr.error(error.error);
      return;
    }
    this.toastr.error(fallback);
  }
}
