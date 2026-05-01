import {HttpClient, HttpContext, HttpParams} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {environment} from '../../../../../environments/environment';
import {SKIP_GLOBAL_LOADER} from '../../../../core/constant/loader-context';
import {
  AttendanceAnalyticsFilters,
  CourseAbsenceStat,
  GroupAttendanceSummary,
  GroupStudentAttendance,
  StudentAttendanceProfile,
  TeacherAbsenceStat
} from '../models/attendance-analytics.model';

@Injectable({
  providedIn: 'root'
})
export class AttendanceAnalyticsApiService {
  private readonly apiUrl = `${environment.apiUrl}admin/attendance/analytics`;
  private readonly localLoaderContext = new HttpContext().set(SKIP_GLOBAL_LOADER, true);

  constructor(private readonly http: HttpClient) {}

  getGroupSummary(filters: AttendanceAnalyticsFilters): Observable<GroupAttendanceSummary> {
    return this.http.get<GroupAttendanceSummary>(`${this.apiUrl}/group-summary`, {
      params: this.toParams(filters),
      context: this.localLoaderContext
    });
  }

  getGroupStudents(filters: AttendanceAnalyticsFilters): Observable<GroupStudentAttendance[]> {
    return this.http.get<GroupStudentAttendance[]>(`${this.apiUrl}/group-students`, {
      params: this.toParams(filters),
      context: this.localLoaderContext
    });
  }

  getCourseAbsenceRanking(filters: AttendanceAnalyticsFilters): Observable<CourseAbsenceStat[]> {
    return this.http.get<CourseAbsenceStat[]>(`${this.apiUrl}/course-absence-ranking`, {
      params: this.toParams(filters),
      context: this.localLoaderContext
    });
  }

  getTeacherAbsenceRanking(filters: AttendanceAnalyticsFilters): Observable<TeacherAbsenceStat[]> {
    return this.http.get<TeacherAbsenceStat[]>(`${this.apiUrl}/teacher-absence-ranking`, {
      params: this.toParams(filters),
      context: this.localLoaderContext
    });
  }

  getStudentProfile(studentId: number, filters: AttendanceAnalyticsFilters): Observable<StudentAttendanceProfile> {
    return this.http.get<StudentAttendanceProfile>(`${this.apiUrl}/students/${studentId}/profile`, {
      params: this.toParams(filters),
      context: this.localLoaderContext
    });
  }

  private toParams(filters: AttendanceAnalyticsFilters): HttpParams {
    let params = new HttpParams();
    if (filters.academicYearId) params = params.set('academicYearId', filters.academicYearId);
    if (filters.semesterId) params = params.set('semesterId', filters.semesterId);
    if (filters.classId) params = params.set('classId', filters.classId);
    if (filters.groupId) params = params.set('groupId', filters.groupId);
    return params;
  }
}
