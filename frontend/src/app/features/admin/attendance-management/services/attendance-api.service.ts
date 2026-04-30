import {HttpClient, HttpContext, HttpParams} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {environment} from '../../../../../environments/environment';
import {SKIP_GLOBAL_LOADER} from '../../../../core/constant/loader-context';
import {
  AttendanceFilters,
  AttendanceSession,
  AttendanceSessionDetails,
  AttendanceSlot,
  AttendanceSummary,
  StartAttendanceSessionRequest,
  UpdateAttendanceRecordRequest
} from '../models/attendance.model';

@Injectable({
  providedIn: 'root'
})
export class AttendanceApiService {
  private readonly apiUrl = `${environment.apiUrl}admin/attendance`;
  private readonly localLoaderContext = new HttpContext().set(SKIP_GLOBAL_LOADER, true);

  constructor(private readonly http: HttpClient) {}

  getSessions(filters: AttendanceFilters): Observable<AttendanceSession[]> {
    let params = new HttpParams();
    if (filters.classId) params = params.set('classId', filters.classId);
    if (filters.courseId) params = params.set('courseId', filters.courseId);
    return this.http.get<AttendanceSession[]>(`${this.apiUrl}/sessions`, {
      params,
      context: this.localLoaderContext
    });
  }

  getAvailableSlots(): Observable<AttendanceSlot[]> {
    return this.http.get<AttendanceSlot[]>(`${this.apiUrl}/available-slots`, {
      context: this.localLoaderContext
    });
  }

  startSession(request: StartAttendanceSessionRequest): Observable<AttendanceSessionDetails> {
    return this.http.post<AttendanceSessionDetails>(`${this.apiUrl}/sessions`, request, {
      context: this.localLoaderContext
    });
  }

  getSessionDetails(id: number): Observable<AttendanceSessionDetails> {
    return this.http.get<AttendanceSessionDetails>(`${this.apiUrl}/sessions/${id}`, {
      context: this.localLoaderContext
    });
  }

  updateStudentStatus(recordId: number, request: UpdateAttendanceRecordRequest): Observable<AttendanceSessionDetails> {
    return this.http.patch<AttendanceSessionDetails>(`${this.apiUrl}/records/${recordId}/status`, request, {
      context: this.localLoaderContext
    });
  }

  closeSession(id: number): Observable<AttendanceSessionDetails> {
    return this.http.patch<AttendanceSessionDetails>(`${this.apiUrl}/sessions/${id}/close`, {}, {
      context: this.localLoaderContext
    });
  }

  getSummary(id: number): Observable<AttendanceSummary> {
    return this.http.get<AttendanceSummary>(`${this.apiUrl}/sessions/${id}/summary`, {
      context: this.localLoaderContext
    });
  }
}
