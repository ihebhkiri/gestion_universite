import {HttpClient, HttpContext, HttpParams} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {environment} from '../../../../../environments/environment';
import {SKIP_GLOBAL_LOADER} from '../../../../core/constant/loader-context';
import {
  CreateResultSessionPayload,
  ResultFilters,
  ResultRecord,
  ResultSession,
  ResultSessionDetailsResponse,
  ResultStats,
  StudentResultOverview,
  UpdateResultScorePayload,
  UpdateResultStatusPayload
} from '../models/result-management.model';

@Injectable({
  providedIn: 'root'
})
export class ResultApiService {
  private readonly apiUrl = `${environment.apiUrl}results`;
  private readonly studentsApiUrl = `${environment.apiUrl}students`;
  private readonly localLoaderContext = new HttpContext().set(SKIP_GLOBAL_LOADER, true);

  constructor(private readonly http: HttpClient) {}

  getSessions(filters?: Partial<ResultFilters>): Observable<ResultSession[]> {
    return this.http.get<ResultSession[]>(`${this.apiUrl}/sessions`, {
      params: this.buildFilterParams(filters),
      context: this.localLoaderContext
    });
  }

  createSession(payload: CreateResultSessionPayload): Observable<ResultSession> {
    return this.http.post<ResultSession>(`${this.apiUrl}/sessions`, payload, {
      context: this.localLoaderContext
    });
  }

  getSessionDetails(sessionId: number): Observable<ResultSessionDetailsResponse> {
    return this.http.get<ResultSessionDetailsResponse>(`${this.apiUrl}/sessions/${sessionId}`, {
      context: this.localLoaderContext
    });
  }

  getResults(sessionId: number): Observable<ResultRecord[]> {
    return this.http.get<ResultRecord[]>(`${this.apiUrl}/sessions/${sessionId}/records`, {
      context: this.localLoaderContext
    });
  }

  updateStudentScore(recordId: number, payload: UpdateResultScorePayload): Observable<ResultRecord> {
    return this.http.put<ResultRecord>(`${this.apiUrl}/records/${recordId}/score`, payload, {
      context: this.localLoaderContext
    });
  }

  updateStudentStatus(recordId: number, payload: UpdateResultStatusPayload): Observable<ResultRecord> {
    return this.http.put<ResultRecord>(`${this.apiUrl}/records/${recordId}/status`, payload, {
      context: this.localLoaderContext
    });
  }

  validateSession(sessionId: number): Observable<ResultSessionDetailsResponse> {
    return this.http.post<ResultSessionDetailsResponse>(`${this.apiUrl}/sessions/${sessionId}/validate`, {}, {
      context: this.localLoaderContext
    });
  }

  publishSession(sessionId: number): Observable<ResultSessionDetailsResponse> {
    return this.http.post<ResultSessionDetailsResponse>(`${this.apiUrl}/sessions/${sessionId}/publish`, {}, {
      context: this.localLoaderContext
    });
  }

  getStats(sessionId: number): Observable<ResultStats> {
    return this.http.get<ResultStats>(`${this.apiUrl}/sessions/${sessionId}/stats`, {
      context: this.localLoaderContext
    });
  }

  getStudentResults(studentId: number): Observable<StudentResultOverview> {
    return this.http.get<StudentResultOverview>(`${this.studentsApiUrl}/${studentId}/results`, {
      context: this.localLoaderContext
    });
  }

  private buildFilterParams(filters?: Partial<ResultFilters>): HttpParams {
    let params = new HttpParams();
    if (!filters) return params;

    Object.entries(filters).forEach(([key, value]) => {
      if (value === null || value === undefined || value === '') return;
      params = params.set(key, value);
    });

    return params;
  }
}
