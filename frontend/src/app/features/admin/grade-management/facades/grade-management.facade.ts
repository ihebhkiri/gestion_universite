import {HttpErrorResponse} from '@angular/common/http';
import {inject, Injectable} from '@angular/core';
import {ToastrService} from 'ngx-toastr';
import {
  BehaviorSubject,
  Observable,
  catchError,
  combineLatest,
  defer,
  finalize,
  forkJoin,
  map,
  of,
  tap
} from 'rxjs';
import {CourseService} from '../../course-managment/services/course.service';
import {AcademicClassService} from '../../academic-class-managment/services/academic-class.service';
import {RoomService} from '../../room-management/services/room.service';
import {SemesterService} from '../../semester-managment/services/semester.service';
import {GroupService} from '../../student-managment/services/group.service';
import {TeacherService} from '../../teacher-managment/services/teacher.service';
import {
  CreateExamPayload,
  EMPTY_GRADE_STATS,
  Exam,
  GradeCourseOption,
  GradeRecord,
  GradeReferenceOption,
  GradeStats,
  SaveDraftGradesPayload,
  UpdateGradePayload
} from '../models/grade-management.model';
import {GradeManagementApiService} from '../services/grade-management-api.service';
import {GradeManagementStateService} from '../services/grade-management-state.service';

@Injectable()
export class GradeManagementFacade {
  private readonly api = inject(GradeManagementApiService);
  private readonly state = inject(GradeManagementStateService);
  private readonly courseService = inject(CourseService);
  private readonly academicClassService = inject(AcademicClassService);
  private readonly groupService = inject(GroupService);
  private readonly roomService = inject(RoomService);
  private readonly semesterService = inject(SemesterService);
  private readonly teacherService = inject(TeacherService);
  private readonly toastr = inject(ToastrService);
  private readonly pendingRequestsSubject = new BehaviorSubject<number>(0);
  private readonly courseOptionsSubject = new BehaviorSubject<GradeCourseOption[]>([]);
  private readonly classOptionsSubject = new BehaviorSubject<GradeReferenceOption[]>([]);
  private readonly groupOptionsSubject = new BehaviorSubject<GradeReferenceOption[]>([]);
  private readonly roomOptionsSubject = new BehaviorSubject<GradeReferenceOption[]>([]);
  private readonly supervisorOptionsSubject = new BehaviorSubject<GradeReferenceOption[]>([]);
  private readonly semesterOptionsSubject = new BehaviorSubject<GradeReferenceOption[]>([]);

  readonly exams$ = this.state.exams$;
  readonly currentExam$ = this.state.currentExam$;
  readonly gradeRecords$ = this.state.gradeRecords$;
  readonly stats$ = this.state.stats$;
  readonly selectedCourseId$ = this.state.selectedCourseId$;
  readonly courseOptions$ = this.courseOptionsSubject.asObservable();
  readonly classOptions$ = this.classOptionsSubject.asObservable();
  readonly groupOptions$ = this.groupOptionsSubject.asObservable();
  readonly roomOptions$ = this.roomOptionsSubject.asObservable();
  readonly supervisorOptions$ = this.supervisorOptionsSubject.asObservable();
  readonly semesterOptions$ = this.semesterOptionsSubject.asObservable();
  readonly localLoading$ = combineLatest([
    this.state.localLoading$,
    this.pendingRequestsSubject.pipe(map(count => count > 0))
  ]).pipe(map(([stateLoading, pending]) => stateLoading || pending));

  loadCourseOptions(): void {
    this.withLocalLoader(() => this.courseService.getCourses(true)).subscribe({
      next: courses => {
        const options = courses.map(course => ({
          id: course.id,
          label: `${course.code} - ${course.title}`,
          meta: `${course.credits} credits`
        }));
        this.courseOptionsSubject.next(options);
        if (!this.state.snapshot.selectedCourseId && options[0]) {
          this.loadExamsByCourse(options[0].id);
        }
      },
      error: error => this.handleError(error, 'Unable to load courses for grade management.')
    });
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
      semesters: this.semesterService.getSemesters(true).pipe(catchError(() => of([])))
    })).subscribe({
      next: refs => {
        const courseOptions = refs.courses.map(course => ({
          id: course.id,
          label: `${course.code} - ${course.title}`,
          meta: `${course.credits} credits`
        }));

        this.courseOptionsSubject.next(courseOptions);
        this.classOptionsSubject.next(refs.classes.map(academicClass => ({
          id: academicClass.id,
          label: academicClass.code,
          meta: academicClass.academicYearLabel
        })));
        this.groupOptionsSubject.next(refs.groups.map(group => ({
          id: group.id,
          label: group.name,
          meta: group.classCode
        })));
        this.roomOptionsSubject.next(refs.rooms.map(room => ({
          id: room.id,
          label: `${room.code} - ${room.name}`,
          meta: `${room.capacity} seats`
        })));
        this.supervisorOptionsSubject.next(refs.teachers.map(teacher => ({
          id: teacher.id,
          label: teacher.fullName || `${teacher.firstName} ${teacher.lastName}`.trim() || teacher.matricule,
          meta: teacher.grade ?? teacher.matricule
        })));
        this.semesterOptionsSubject.next(refs.semesters.map(semester => ({
          id: semester.id,
          label: semester.name,
          meta: semester.academicYearLabel
        })));

        if (!this.state.snapshot.selectedCourseId && courseOptions[0]) {
          this.loadExamsByCourse(courseOptions[0].id);
        }
      },
      error: error => this.handleError(error, 'Unable to load gradebook reference data.')
    });
  }

  loadExamsByCourse(courseId: number): void {
    this.state.setSelectedCourseId(courseId);
    this.withLocalLoader(() => this.api.getExamsByCourse(courseId)).subscribe({
      next: exams => {
        this.state.setExams(exams);
        const currentId = this.state.snapshot.currentExam?.id;
        const currentExam = currentId ? exams.find(exam => exam.id === currentId) : null;
        const nextExam = currentExam ?? exams[0] ?? null;
        if (nextExam) {
          this.loadExamDetails(nextExam.id);
          return;
        }
        this.state.clearExamDetails();
      },
      error: error => this.handleError(error, 'Unable to load exams for this course.')
    });
  }

  loadExamDetails(examId: number): void {
    this.withLocalLoader(() => this.api.getExamDetails(examId)).subscribe({
      next: details => {
        this.applyDetails(details, false);
      },
      error: error => this.handleError(error, 'Unable to load exam grade details.')
    });
  }

  createExam(payload: CreateExamPayload): void {
    this.withLocalLoader(() => this.api.createExam(payload)).subscribe({
      next: details => {
        this.applyDetails(details, false);
        this.toastr.success('Exam created for grade management.');
      },
      error: error => this.handleError(error, 'Unable to create exam.')
    });
  }

  updateGrade(recordId: number, payload: UpdateGradePayload): void {
    this.withLocalLoader(() => this.api.updateGrade(recordId, payload)).subscribe({
      next: details => this.applyDetails(details, true, 'Grade updated.'),
      error: error => this.handleError(error, 'Unable to update grade.')
    });
  }

  saveDraftGrades(payload: SaveDraftGradesPayload): void {
    this.withLocalLoader(() => this.api.saveDraftGrades(payload)).subscribe({
      next: response => {
        this.state.setGradeRecords(response.records);
        this.state.setStats(response.stats ?? this.buildStats(response.records));
        this.toastr.success('Draft grades saved.');
      },
      error: error => this.handleError(error, 'Unable to save draft grades.')
    });
  }

  validateGrade(recordId: number): void {
    this.withLocalLoader(() => this.api.validateGrade(recordId)).subscribe({
      next: details => this.applyDetails(details, true, 'Grade validated.'),
      error: error => this.handleError(error, 'Unable to validate grade.')
    });
  }

  publishExam(examId: number): void {
    this.withLocalLoader(() => this.api.publishExam(examId)).subscribe({
      next: details => this.applyDetails(details, true, 'Exam grades published.'),
      error: error => this.handleError(error, 'Unable to publish exam grades.')
    });
  }

  private applyDetails(
    details: {exam: Exam; records: GradeRecord[]; stats: GradeStats | null},
    showToast: boolean,
    message?: string
  ): void {
    this.state.upsertExam(details.exam);
    this.state.setGradeRecords(details.records);
    this.state.setStats(details.stats ?? this.buildStats(details.records));
    if (showToast && message) {
      this.toastr.success(message);
    }
  }

  private withLocalLoader<T>(requestFactory: () => Observable<T>): Observable<T> {
    return defer(() => {
      this.pendingRequestsSubject.next(this.pendingRequestsSubject.value + 1);
      this.state.setLocalLoading(true);
      return requestFactory().pipe(
        finalize(() => {
          this.pendingRequestsSubject.next(Math.max(0, this.pendingRequestsSubject.value - 1));
          if (this.pendingRequestsSubject.value === 0) {
            this.state.setLocalLoading(false);
          }
        })
      );
    });
  }

  private buildStats(records: GradeRecord[]): GradeStats {
    if (records.length === 0) return EMPTY_GRADE_STATS;

    const gradedRecords = records.filter(record => record.score !== null && record.score !== undefined);
    const scores = gradedRecords.map(record => record.score).filter((score): score is number => score !== null);
    const validatedCount = records.filter(record => record.status === 'VALIDATED').length;
    const publishedCount = records.filter(record => record.status === 'PUBLISHED').length;
    const draftCount = records.filter(record => record.status === 'DRAFT').length;
    const passedCount = scores.filter(score => score >= 10).length;

    return {
      totalStudents: records.length,
      gradedCount: gradedRecords.length,
      notGradedCount: records.filter(record => record.status === 'NOT_GRADED').length,
      draftCount,
      validatedCount,
      publishedCount,
      averageScore: scores.length ? this.round(scores.reduce((sum, score) => sum + score, 0) / scores.length) : null,
      minScore: scores.length ? Math.min(...scores) : null,
      maxScore: scores.length ? Math.max(...scores) : null,
      successRate: scores.length ? this.round((passedCount / scores.length) * 100) : null
    };
  }

  private round(value: number): number {
    return Math.round(value * 100) / 100;
  }

  private handleError(error: unknown, fallback: string): void {
    if (error instanceof HttpErrorResponse && typeof error.error === 'string') {
      this.toastr.error(error.error);
      return;
    }
    this.toastr.error(fallback);
  }
}
