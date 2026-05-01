import {HttpErrorResponse} from '@angular/common/http';
import {inject, Injectable} from '@angular/core';
import {FormBuilder} from '@angular/forms';
import {ToastrService} from 'ngx-toastr';
import {
  BehaviorSubject,
  Observable,
  catchError,
  combineLatest,
  debounceTime,
  defer,
  distinctUntilChanged,
  finalize,
  forkJoin,
  map,
  of,
  shareReplay,
  startWith
} from 'rxjs';
import {AcademicClassService} from '../../academic-class-managment/services/academic-class.service';
import {AcademicYearService} from '../../academic-year-managment/services/academic-year.service';
import {SemesterService} from '../../semester-managment/services/semester.service';
import {GroupService} from '../../student-managment/services/group.service';
import {AttendanceAnalyticsFilters} from '../models/attendance-analytics.model';
import {AttendanceAnalyticsApiService} from '../services/attendance-analytics-api.service';
import {AttendanceAnalyticsStateService} from '../services/attendance-analytics-state.service';

@Injectable()
export class AttendanceAnalyticsFacade {
  private readonly api = inject(AttendanceAnalyticsApiService);
  private readonly state = inject(AttendanceAnalyticsStateService);
  private readonly academicYearService = inject(AcademicYearService);
  private readonly semesterService = inject(SemesterService);
  private readonly classService = inject(AcademicClassService);
  private readonly groupService = inject(GroupService);
  private readonly toastr = inject(ToastrService);
  private readonly fb = inject(FormBuilder);
  private readonly pendingRequestsSubject = new BehaviorSubject<number>(0);

  readonly filtersForm = this.fb.group({
    academicYearId: this.fb.nonNullable.control(''),
    semesterId: this.fb.nonNullable.control(''),
    classId: this.fb.nonNullable.control(''),
    groupId: this.fb.nonNullable.control('')
  });

  readonly groupSummary$ = this.state.groupSummary$;
  readonly students$ = this.state.students$;
  readonly courseAbsenceRanking$ = this.state.courseAbsenceRanking$;
  readonly teacherAbsenceRanking$ = this.state.teacherAbsenceRanking$;
  readonly selectedStudentProfile$ = this.state.selectedStudentProfile$;
  readonly localLoading$ = combineLatest([
    this.state.localLoading$,
    this.pendingRequestsSubject.pipe(map(count => count > 0), distinctUntilChanged())
  ]).pipe(map(([stateLoading, pending]) => stateLoading || pending));

  readonly academicYears$ = this.withLocalLoader(() => this.academicYearService.getAll(true))
    .pipe(catchError(() => of([])), shareReplay({bufferSize: 1, refCount: true}));
  readonly semesters$ = this.withLocalLoader(() => this.semesterService.getSemesters(true))
    .pipe(catchError(() => of([])), shareReplay({bufferSize: 1, refCount: true}));
  readonly classes$ = this.withLocalLoader(() => this.classService.getClasses(true))
    .pipe(catchError(() => of([])), shareReplay({bufferSize: 1, refCount: true}));
  readonly groups$ = this.withLocalLoader(() => this.groupService.getGroups(true))
    .pipe(catchError(() => of([])), shareReplay({bufferSize: 1, refCount: true}));

  readonly filteredSemesters$ = combineLatest([
    this.semesters$,
    this.filtersForm.controls.academicYearId.valueChanges.pipe(
      startWith(this.filtersForm.controls.academicYearId.value),
      map(() => this.filtersForm.controls.academicYearId.value)
    )
  ]).pipe(
    map(([semesters, academicYearId]) => academicYearId
      ? semesters.filter(semester => `${semester.academicYearId}` === academicYearId)
      : semesters)
  );

  readonly filteredClasses$ = combineLatest([
    this.classes$,
    this.filtersForm.controls.academicYearId.valueChanges.pipe(
      startWith(this.filtersForm.controls.academicYearId.value),
      map(() => this.filtersForm.controls.academicYearId.value)
    )
  ]).pipe(
    map(([classes, academicYearId]) => academicYearId
      ? classes.filter(academicClass => `${academicClass.academicYearId}` === academicYearId)
      : classes)
  );

  readonly filteredGroups$ = combineLatest([
    this.groups$,
    this.filtersForm.controls.classId.valueChanges.pipe(
      startWith(this.filtersForm.controls.classId.value),
      map(() => this.filtersForm.controls.classId.value)
    )
  ]).pipe(
    map(([groups, classId]) => classId
      ? groups.filter(group => `${group.classId}` === classId)
      : groups)
  );

  constructor() {
    this.filtersForm.controls.academicYearId.valueChanges.subscribe(() => {
      this.filtersForm.patchValue({semesterId: '', classId: '', groupId: ''}, {emitEvent: false});
    });

    this.filtersForm.controls.classId.valueChanges.subscribe(() => {
      this.filtersForm.patchValue({groupId: ''}, {emitEvent: false});
    });

    this.filtersForm.valueChanges.pipe(
      debounceTime(250),
      map(() => this.filtersForm.getRawValue()),
      distinctUntilChanged((left, right) => JSON.stringify(left) === JSON.stringify(right))
    ).subscribe(filters => {
      this.state.setFilters(filters);
      this.loadDashboard(filters);
    });
  }

  init(): void {
    this.loadDashboard(this.filtersForm.getRawValue());
  }

  loadDashboard(filters: AttendanceAnalyticsFilters = this.filtersForm.getRawValue()): void {
    this.withLocalLoader(() => forkJoin({
      groupSummary: this.api.getGroupSummary(filters),
      students: this.api.getGroupStudents(filters),
      courseAbsenceRanking: this.api.getCourseAbsenceRanking(filters),
      teacherAbsenceRanking: this.api.getTeacherAbsenceRanking(filters)
    })).subscribe({
      next: dashboard => this.state.setDashboard(
        dashboard.groupSummary,
        dashboard.students,
        dashboard.courseAbsenceRanking,
        dashboard.teacherAbsenceRanking
      ),
      error: error => this.handleError(error, 'Unable to load attendance analytics.')
    });
  }

  selectStudent(studentId: number): void {
    this.withLocalLoader(() => this.api.getStudentProfile(studentId, this.state.snapshot.filters)).subscribe({
      next: profile => this.state.setSelectedStudentProfile(profile),
      error: error => this.handleError(error, 'Unable to load student attendance profile.')
    });
  }

  clearSelectedStudent(): void {
    this.state.setSelectedStudentProfile(null);
  }

  resetFilters(): void {
    this.filtersForm.reset({
      academicYearId: '',
      semesterId: '',
      classId: '',
      groupId: ''
    });
  }

  private withLocalLoader<T>(requestFactory: () => Observable<T>): Observable<T> {
    return defer(() => {
      this.pendingRequestsSubject.next(this.pendingRequestsSubject.value + 1);
      return requestFactory().pipe(
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
}
