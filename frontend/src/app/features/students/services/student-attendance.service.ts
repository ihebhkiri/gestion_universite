import { HttpClient, HttpContext, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { SKIP_GLOBAL_LOADER } from '../../../core/constant/loader-context';
import { environment } from '../../../../environments/environment';
import { StudentPage } from '../models/student-course.model';
import {
  StudentAttendance,
  StudentAttendanceQueryParams,
  StudentAttendanceSummary,
  StudentTopAbsence,
} from '../models/student-attendance.model';

@Injectable({
  providedIn: 'root',
})
export class StudentAttendanceService {
  private readonly http = inject(HttpClient);
  private readonly attendanceUrl = `${environment.apiUrl}students/me/attendance`;
  private readonly localLoaderContext = new HttpContext().set(SKIP_GLOBAL_LOADER, true);

  getMyAttendance(params: StudentAttendanceQueryParams): Observable<StudentPage<StudentAttendance>> {
    return this.http.get<StudentPage<StudentAttendance>>(this.attendanceUrl, {
      params: this.buildParams(params),
      context: this.localLoaderContext,
    });
  }

  getMyAttendanceSummary(): Observable<StudentAttendanceSummary> {
    return this.http.get<StudentAttendanceSummary>(`${this.attendanceUrl}/summary`, {
      context: this.localLoaderContext,
    });
  }

  getTopAbsences(limit = 5): Observable<StudentTopAbsence[]> {
    return this.http.get<StudentTopAbsence[]>(`${this.attendanceUrl}/top-absences`, {
      params: new HttpParams().set('limit', limit),
      context: this.localLoaderContext,
    });
  }

  private buildParams(query: StudentAttendanceQueryParams): HttpParams {
    let params = new HttpParams()
      .set('page', query.page)
      .set('size', query.size);

    if (query.status) {
      params = params.set('status', query.status);
    }

    if (query.excludeStatus) {
      params = params.set('excludeStatus', query.excludeStatus);
    }

    if (query.period) {
      params = params.set('period', query.period);
    }

    if (query.subjectId) {
      params = params.set('subjectId', query.subjectId);
    }

    if (query.teacherId) {
      params = params.set('teacherId', query.teacherId);
    }

    if (query.fromDate) {
      params = params.set('fromDate', query.fromDate);
    }

    if (query.toDate) {
      params = params.set('toDate', query.toDate);
    }

    if (query.sort) {
      params = params.set('sort', query.sort);
    }

    return params;
  }
}
