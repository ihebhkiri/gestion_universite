import {Injectable} from '@angular/core';
import {BehaviorSubject, distinctUntilChanged, map} from 'rxjs';
import {
  AttendanceAnalyticsFilters,
  AttendanceAnalyticsState,
  CourseAbsenceStat,
  GroupAttendanceSummary,
  GroupStudentAttendance,
  StudentAttendanceProfile,
  TeacherAbsenceStat
} from '../models/attendance-analytics.model';

const INITIAL_FILTERS: AttendanceAnalyticsFilters = {
  academicYearId: '',
  semesterId: '',
  classId: '',
  groupId: ''
};

const INITIAL_STATE: AttendanceAnalyticsState = {
  filters: INITIAL_FILTERS,
  groupSummary: null,
  students: [],
  courseAbsenceRanking: [],
  teacherAbsenceRanking: [],
  selectedStudentProfile: null,
  localLoading: false
};

@Injectable()
export class AttendanceAnalyticsStateService {
  private readonly stateSubject = new BehaviorSubject<AttendanceAnalyticsState>(INITIAL_STATE);

  readonly state$ = this.stateSubject.asObservable();
  readonly filters$ = this.select(state => state.filters);
  readonly groupSummary$ = this.select(state => state.groupSummary);
  readonly students$ = this.select(state => state.students);
  readonly courseAbsenceRanking$ = this.select(state => state.courseAbsenceRanking);
  readonly teacherAbsenceRanking$ = this.select(state => state.teacherAbsenceRanking);
  readonly selectedStudentProfile$ = this.select(state => state.selectedStudentProfile);
  readonly localLoading$ = this.select(state => state.localLoading);

  setFilters(filters: AttendanceAnalyticsFilters): void {
    this.patch({filters});
  }

  setDashboard(
    groupSummary: GroupAttendanceSummary,
    students: GroupStudentAttendance[],
    courseAbsenceRanking: CourseAbsenceStat[],
    teacherAbsenceRanking: TeacherAbsenceStat[]
  ): void {
    this.patch({groupSummary, students, courseAbsenceRanking, teacherAbsenceRanking});
  }

  setSelectedStudentProfile(selectedStudentProfile: StudentAttendanceProfile | null): void {
    this.patch({selectedStudentProfile});
  }

  setLocalLoading(localLoading: boolean): void {
    this.patch({localLoading});
  }

  get snapshot(): AttendanceAnalyticsState {
    return this.stateSubject.value;
  }

  private patch(partial: Partial<AttendanceAnalyticsState>): void {
    this.stateSubject.next({...this.stateSubject.value, ...partial});
  }

  private select<T>(selector: (state: AttendanceAnalyticsState) => T) {
    return this.state$.pipe(
      map(selector),
      distinctUntilChanged()
    );
  }
}
