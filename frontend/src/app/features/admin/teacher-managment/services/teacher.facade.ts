import {inject, Injectable, OnDestroy} from '@angular/core';
import {FormBuilder} from '@angular/forms';
import {Router} from '@angular/router';
import {ToastrService} from 'ngx-toastr';
import {
  BehaviorSubject,
  Subject,
  catchError,
  combineLatest,
  debounceTime,
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
import {DepartmentService} from '../../department-managment/services/department.service';
import {SemesterService} from '../../semester-managment/services/semester.service';
import {SpecialityService} from '../../speciality-managment/services/speciality.service';
import {GroupService} from '../../student-managment/services/group.service';
import {SubjectService} from '../../subject-managment/services/subject.service';
import {
  AddTeacherRequest,
  AssignmentForm,
  PageableResponse,
  TeacherFilterForm,
  TeacherFilters,
  TeacherForm,
  TeacherResponse,
  TeacherSort,
  TeacherStatus,
  UpdateTeacherRequest
} from '../models/teacher.model';
import {TeacherService} from './teacher.service';

const EMPTY_FILTERS: TeacherFilters = {
  search: '',
  department: '',
  status: '',
  subject: '',
  speciality: '',
  hiredFrom: '',
  hiredTo: ''
};

const EMPTY_PAGE: PageableResponse<TeacherResponse> = {
  content: [],
  totalPages: 0,
  totalElements: 0,
  size: 10,
  number: 0,
  first: true,
  last: true,
  numberOfElements: 0,
  empty: true
};

@Injectable()
export class TeacherFacade implements OnDestroy {
  readonly statuses: TeacherStatus[] = ['ACTIVE', 'INACTIVE', 'ON_LEAVE'];

  private readonly fb = inject(FormBuilder);
  private readonly teacherService = inject(TeacherService);
  private readonly departmentService = inject(DepartmentService);
  private readonly subjectService = inject(SubjectService);
  private readonly specialityService = inject(SpecialityService);
  private readonly courseService = inject(CourseService);
  private readonly semesterService = inject(SemesterService);
  private readonly classService = inject(AcademicClassService);
  private readonly groupService = inject(GroupService);
  private readonly router = inject(Router);
  private readonly toastr = inject(ToastrService);

  readonly filtersForm = this.fb.group<TeacherFilterForm>({
    search: this.fb.nonNullable.control(''),
    department: this.fb.nonNullable.control(''),
    status: this.fb.nonNullable.control(''),
    subject: this.fb.nonNullable.control(''),
    speciality: this.fb.nonNullable.control(''),
    hiredFrom: this.fb.nonNullable.control(''),
    hiredTo: this.fb.nonNullable.control('')
  });

  readonly teacherForm = this.fb.group<TeacherForm>({
    id: this.fb.control<number | null>(null),
    role: this.fb.nonNullable.control('TEACHER'),
    email: this.fb.nonNullable.control(''),
    password: this.fb.nonNullable.control(''),
    firstName: this.fb.nonNullable.control(''),
    lastName: this.fb.nonNullable.control(''),
    gender: this.fb.nonNullable.control(''),
    cin: this.fb.nonNullable.control(''),
    phone: this.fb.nonNullable.control(''),
    grade: this.fb.nonNullable.control(''),
    departmentId: this.fb.nonNullable.control(''),
    specialityId: this.fb.nonNullable.control(''),
    status: this.fb.nonNullable.control<TeacherStatus>('ACTIVE')
  });

  readonly assignmentForm = this.fb.group<AssignmentForm>({
    courseId: this.fb.nonNullable.control(''),
    semesterId: this.fb.nonNullable.control(''),
    classId: this.fb.nonNullable.control('')
  });

  private readonly destroy$ = new Subject<void>();
  private readonly filtersSubject = new BehaviorSubject<TeacherFilters>(EMPTY_FILTERS);
  private readonly pageSubject = new BehaviorSubject<number>(0);
  private readonly sizeSubject = new BehaviorSubject<number>(10);
  private readonly sortSubject = new BehaviorSubject<TeacherSort>({active: 'createdAt', direction: 'desc'});
  private readonly refreshSubject = new BehaviorSubject<number>(0);
  private readonly loadingSubject = new BehaviorSubject<boolean>(false);
  private readonly savingSubject = new BehaviorSubject<boolean>(false);
  private readonly errorSubject = new BehaviorSubject<string | null>(null);
  private readonly selectedIdsSubject = new BehaviorSubject<Set<number>>(new Set<number>());
  private readonly profileTeacherSubject = new BehaviorSubject<TeacherResponse | null>(null);
  private readonly editingSubject = new BehaviorSubject<boolean>(false);
  private readonly assigningTeacherSubject = new BehaviorSubject<TeacherResponse | null>(null);

  readonly loading$ = this.loadingSubject.asObservable();
  readonly saving$ = this.savingSubject.asObservable();
  readonly error$ = this.errorSubject.asObservable();
  readonly selectedIds$ = this.selectedIdsSubject.asObservable();
  readonly selectedCount$ = this.selectedIds$.pipe(map(ids => ids.size));
  readonly pageIndex$ = this.pageSubject.asObservable();
  readonly pageSize$ = this.sizeSubject.asObservable();
  readonly sort$ = this.sortSubject.asObservable();
  readonly profileTeacher$ = this.profileTeacherSubject.asObservable();
  readonly isEditorOpen$ = this.editingSubject.asObservable();
  readonly assigningTeacher$ = this.assigningTeacherSubject.asObservable();

  readonly departments$ = this.departmentService.getDepartments().pipe(
    catchError(() => of([])),
    shareReplay({bufferSize: 1, refCount: true})
  );
  readonly subjects$ = this.subjectService.getSubjects().pipe(
    catchError(() => of([])),
    shareReplay({bufferSize: 1, refCount: true})
  );
  readonly specialities$ = this.specialityService.getSpecialities().pipe(
    catchError(() => of([])),
    shareReplay({bufferSize: 1, refCount: true})
  );
  readonly courses$ = this.courseService.getCourses().pipe(
    catchError(() => of([])),
    shareReplay({bufferSize: 1, refCount: true})
  );
  readonly semesters$ = this.semesterService.getSemesters().pipe(
    catchError(() => of([])),
    shareReplay({bufferSize: 1, refCount: true})
  );
  readonly classes$ = this.classService.getClasses().pipe(
    catchError(() => of([])),
    shareReplay({bufferSize: 1, refCount: true})
  );
  private readonly assignmentClassId$ = this.assignmentForm.controls.classId.valueChanges.pipe(
    startWith(this.assignmentForm.controls.classId.value),
    distinctUntilChanged()
  );
  readonly groups$ = this.groupService.getGroups(true).pipe(
    catchError(() => of([])),
    shareReplay({bufferSize: 1, refCount: true})
  );
  readonly groupsForSelectedClass$ = combineLatest([this.groups$, this.assignmentClassId$]).pipe(
    map(([groups, classId]) => {
      const selectedClassId = Number(classId);
      if (!classId || Number.isNaN(selectedClassId)) return [];
      return groups.filter(group => Number(group.classId) === selectedClassId);
    })
  );

  readonly page$ = combineLatest([
    this.filtersSubject.pipe(distinctUntilChanged(this.sameJson)),
    this.pageSubject.pipe(distinctUntilChanged()),
    this.sizeSubject.pipe(distinctUntilChanged()),
    this.sortSubject.pipe(distinctUntilChanged(this.sameJson)),
    this.refreshSubject
  ]).pipe(
    tap(() => {
      this.loadingSubject.next(true);
      this.errorSubject.next(null);
    }),
    switchMap(([filters, page, size, sort]) =>
      this.teacherService.getTeachers(page, size, filters, sort).pipe(
        catchError(() => {
          this.errorSubject.next('Unable to load teachers. Please try again.');
          return of({...EMPTY_PAGE, size, number: page});
        }),
        finalize(() => this.loadingSubject.next(false))
      )
    ),
    tap(page => this.trimSelectionToExistingRows(page.content)),
    shareReplay({bufferSize: 1, refCount: true})
  );

  readonly teachers$ = this.page$.pipe(map(page => page.content));
  readonly totalElements$ = this.page$.pipe(map(page => page.totalElements));
  readonly totalPages$ = this.page$.pipe(map(page => page.totalPages));
  readonly pageNumbers$ = this.totalPages$.pipe(map(total => Array.from({length: total}, (_, index) => index)));

  readonly allVisibleSelected$ = combineLatest([this.teachers$, this.selectedIds$]).pipe(
    map(([teachers, selectedIds]) => teachers.length > 0 && teachers.every(teacher => selectedIds.has(teacher.id)))
  );

  readonly someVisibleSelected$ = combineLatest([this.teachers$, this.selectedIds$]).pipe(
    map(([teachers, selectedIds]) => teachers.some(teacher => selectedIds.has(teacher.id)))
  );

  constructor() {
    this.filtersForm.valueChanges.pipe(
      startWith(this.filtersForm.getRawValue()),
      debounceTime(400),
      map(value => this.normalizeFilters(value as TeacherFilters)),
      distinctUntilChanged(this.sameJson),
      takeUntil(this.destroy$)
    ).subscribe(filters => {
      this.pageSubject.next(0);
      this.filtersSubject.next(filters);
    });
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

  changePage(page: number, totalPages: number): void {
    if (page < 0 || page >= totalPages) return;
    this.pageSubject.next(page);
  }

  changePageSize(size: string): void {
    this.pageSubject.next(0);
    this.sizeSubject.next(Number(size));
  }

  sortBy(field: string): void {
    const current = this.sortSubject.value;
    const direction = current.active === field && current.direction === 'asc' ? 'desc' : 'asc';
    this.pageSubject.next(0);
    this.sortSubject.next({active: field, direction});
  }

  openCreate(): void {
    this.teacherForm.reset({
      id: null,
      role: 'TEACHER',
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      gender: '',
      cin: '',
      phone: '',
      grade: '',
      departmentId: '',
      specialityId: '',
      status: 'ACTIVE'
    });
    this.editingSubject.next(true);
  }

  openEdit(teacher: TeacherResponse): void {
    this.teacherForm.reset({
      id: teacher.id,
      role: 'TEACHER',
      email: teacher.email ?? '',
      password: '',
      firstName: teacher.firstName ?? '',
      lastName: teacher.lastName ?? '',
      gender: teacher.gender ?? '',
      cin: teacher.cin ?? '',
      phone: teacher.phone ?? '',
      grade: teacher.grade ?? '',
      departmentId: teacher.departmentId?.toString() ?? '',
      specialityId: teacher.specialityId?.toString() ?? '',
      status: teacher.status ?? 'ACTIVE'
    });
    this.editingSubject.next(true);
  }

  closeEditor(): void {
    this.editingSubject.next(false);
  }

  saveTeacher(): void {
    const value = this.teacherForm.getRawValue();
    if (!value.firstName || !value.lastName || !value.departmentId) {
      this.toastr.warning('First name, last name, and department are required.');
      return;
    }

    this.savingSubject.next(true);
    const request$ = value.id
      ? this.teacherService.updateTeacher(value.id, this.toUpdateRequest(value))
      : this.teacherService.createTeacher(this.toAddRequest(value));

    request$.pipe(finalize(() => this.savingSubject.next(false))).subscribe({
      next: () => {
        this.toastr.success(value.id ? 'Teacher updated.' : 'Teacher created.');
        this.closeEditor();
        this.refresh();
      },
      error: () => this.toastr.error('Unable to save teacher.')
    });
  }

  openProfile(teacher: TeacherResponse): void {
    this.profileTeacherSubject.next(teacher);
  }

  closeProfile(): void {
    this.profileTeacherSubject.next(null);
  }

  openAssignment(teacher: TeacherResponse): void {
    this.assignmentForm.reset({courseId: '', semesterId: '', classId: ''});
    this.assigningTeacherSubject.next(teacher);
  }

  closeAssignment(): void {
    this.assigningTeacherSubject.next(null);
  }

  assignTeacher(): void {
    const teacher = this.assigningTeacherSubject.value;
    const value = this.assignmentForm.getRawValue();
    if (!teacher || !value.courseId || !value.semesterId || !value.classId) {
      this.toastr.warning('Choose a course, semester, and class.');
      return;
    }

    this.savingSubject.next(true);
    this.teacherService.assignTeacher(teacher.id, {
      courseId: Number(value.courseId),
      semesterId: Number(value.semesterId),
      classId: Number(value.classId)
    }).pipe(finalize(() => this.savingSubject.next(false))).subscribe({
      next: () => {
        this.toastr.success('Teacher assigned.');
        this.closeAssignment();
        this.refresh();
      },
      error: () => this.toastr.error('Unable to assign teacher.')
    });
  }

  deleteTeacher(teacher: TeacherResponse): void {
    if (!confirm(`Delete ${teacher.fullName || 'this teacher'}?`)) return;
    this.teacherService.deleteTeacher(teacher.id).subscribe({
      next: () => {
        this.removeSelectedIds([teacher.id]);
        this.toastr.success('Teacher deleted.');
        this.refresh();
      },
      error: () => this.toastr.error('Unable to delete teacher.')
    });
  }

  bulkDeleteSelected(): void {
    const ids = Array.from(this.selectedIdsSubject.value);
    if (ids.length === 0) return;
    if (!confirm(`Delete ${ids.length} selected teacher(s)?`)) return;

    this.savingSubject.next(true);
    this.teacherService.batchDelete(ids).pipe(finalize(() => this.savingSubject.next(false))).subscribe({
      next: () => {
        this.clearSelection();
        this.toastr.success('Selected teachers deleted.');
        this.refresh();
      },
      error: () => this.toastr.error('Unable to delete selected teachers.')
    });
  }

  isSelected(id: number): boolean {
    return this.selectedIdsSubject.value.has(id);
  }

  toggleOne(id: number, checked: boolean): void {
    const next = new Set(this.selectedIdsSubject.value);
    checked ? next.add(id) : next.delete(id);
    this.selectedIdsSubject.next(next);
  }

  toggleVisible(teachers: TeacherResponse[], checked: boolean): void {
    const next = new Set(this.selectedIdsSubject.value);
    teachers.forEach(teacher => checked ? next.add(teacher.id) : next.delete(teacher.id));
    this.selectedIdsSubject.next(next);
  }

  clearSelection(): void {
    this.selectedIdsSubject.next(new Set<number>());
  }

  goToAssignmentPage(teacher: TeacherResponse): void {
    this.router.navigateByUrl(`/admins/teachers?teacherId=${teacher.id}`);
  }

  statusClass(status: string): string {
    const classes: Record<string, string> = {
      ACTIVE: 'bg-[#ecfdf5] text-[#065f46]',
      INACTIVE: 'bg-surface-container-high text-on-surface-variant',
      ON_LEAVE: 'bg-tertiary-fixed text-on-primary-fixed-variant'
    };
    return classes[status] ?? classes['INACTIVE'];
  }

  statusLabel(status: string): string {
    return status.replace('_', ' ');
  }

  private normalizeFilters(value: TeacherFilters): TeacherFilters {
    return {
      search: value.search?.trim() ?? '',
      department: value.department ?? '',
      status: value.status ?? '',
      subject: value.subject ?? '',
      speciality: value.speciality ?? '',
      hiredFrom: value.hiredFrom ?? '',
      hiredTo: value.hiredTo ?? ''
    };
  }

  private sameJson<T>(left: T, right: T): boolean {
    return JSON.stringify(left) === JSON.stringify(right);
  }

  private toAddRequest(value: any): AddTeacherRequest {
    return {
      role: value.role || 'TEACHER',
      email: value.email,
      password: value.password,
      firstName: value.firstName,
      lastName: value.lastName,
      cin: value.cin,
      phone: value.phone,
      gender: value.gender,
      departmentId: Number(value.departmentId),
      grade: value.grade,
      specialityId: value.specialityId ? Number(value.specialityId) : null,
      status: value.status
    };
  }

  private toUpdateRequest(value: any): UpdateTeacherRequest {
    return {
      firstName: value.firstName,
      lastName: value.lastName,
      gender: value.gender,
      cin: value.cin,
      phone: value.phone,
      grade: value.grade,
      departmentId: Number(value.departmentId),
      specialityId: value.specialityId ? Number(value.specialityId) : null,
      status: value.status
    };
  }

  private trimSelectionToExistingRows(teachers: TeacherResponse[]): void {
    if (teachers.length > 0) return;
    this.clearSelection();
  }

  private removeSelectedIds(ids: number[]): void {
    const next = new Set(this.selectedIdsSubject.value);
    ids.forEach(id => next.delete(id));
    this.selectedIdsSubject.next(next);
  }
}
