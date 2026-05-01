import {HttpClient, HttpContext, HttpParams} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {environment} from '../../../../../environments/environment';
import {SKIP_GLOBAL_LOADER} from '../../../../core/constant/loader-context';
import {
  ExamConflict,
  ExamConflictCheckRequest,
  ExamFilters,
  ExamRequest,
  ExamResponse,
  ExamStatus,
  ExamStatusRequest,
  ExamSummary
} from '../models/exam.model';

@Injectable({
  providedIn: 'root'
})
export class ExamApiService {
  private readonly apiUrl = `${environment.apiUrl}admin/exams`;
  private readonly localLoaderContext = new HttpContext().set(SKIP_GLOBAL_LOADER, true);

  constructor(private readonly http: HttpClient) {}

  getExams(filters: ExamFilters): Observable<ExamResponse[]> {
    return this.http.get<ExamResponse[]>(this.apiUrl, {
      params: this.buildParams(filters),
      context: this.localLoaderContext
    });
  }

  getExam(id: number): Observable<ExamResponse> {
    return this.http.get<ExamResponse>(`${this.apiUrl}/${id}`, {
      context: this.localLoaderContext
    });
  }

  getSummary(filters: ExamFilters): Observable<ExamSummary> {
    return this.http.get<ExamSummary>(`${this.apiUrl}/summary`, {
      params: this.buildParams(filters),
      context: this.localLoaderContext
    });
  }

  createExam(request: ExamRequest): Observable<ExamResponse> {
    return this.http.post<ExamResponse>(this.apiUrl, request, {
      context: this.localLoaderContext
    });
  }

  updateExam(id: number, request: ExamRequest): Observable<ExamResponse> {
    return this.http.put<ExamResponse>(`${this.apiUrl}/${id}`, request, {
      context: this.localLoaderContext
    });
  }

  deleteExam(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, {
      context: this.localLoaderContext
    });
  }

  cancelExam(id: number): Observable<ExamResponse> {
    return this.http.patch<ExamResponse>(`${this.apiUrl}/${id}/cancel`, {}, {
      context: this.localLoaderContext
    });
  }

  changeStatus(id: number, status: ExamStatus): Observable<ExamResponse> {
    const request: ExamStatusRequest = {status};
    return this.http.patch<ExamResponse>(`${this.apiUrl}/${id}/status`, request, {
      context: this.localLoaderContext
    });
  }

  checkConflicts(request: ExamConflictCheckRequest): Observable<ExamConflict[]> {
    return this.http.post<ExamConflict[]>(`${this.apiUrl}/conflicts/check`, request, {
      context: this.localLoaderContext
    });
  }

  private buildParams(filters: ExamFilters): HttpParams {
    let params = new HttpParams();
    if (filters.academicYearId) params = params.set('academicYearId', filters.academicYearId);
    if (filters.semesterId) params = params.set('semesterId', filters.semesterId);
    if (filters.courseId) params = params.set('courseId', filters.courseId);
    if (filters.classId) params = params.set('classId', filters.classId);
    if (filters.groupId) params = params.set('groupId', filters.groupId);
    if (filters.roomId) params = params.set('roomId', filters.roomId);
    if (filters.supervisorId) params = params.set('supervisorId', filters.supervisorId);
    if (filters.date) params = params.set('date', filters.date);
    if (filters.status) params = params.set('status', filters.status);
    return params;
  }
}
