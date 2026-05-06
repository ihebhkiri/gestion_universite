import {HttpClient, HttpContext, HttpParams} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {environment} from '../../../../../environments/environment';
import {SKIP_GLOBAL_LOADER} from '../../../../core/constant/loader-context';
import {AttendanceAnalyticsFilters} from '../models/attendance-analytics.model';

@Injectable({
  providedIn: 'root'
})
export class AttendanceAiReportService {
  private readonly apiUrl = `${environment.apiUrl.replace('/api/v1/', '/api/')}attendance-analytics/ai-report/pdf`;
  private readonly localLoaderContext = new HttpContext().set(SKIP_GLOBAL_LOADER, true);

  constructor(private readonly http: HttpClient) {}

  generatePdf(filters: AttendanceAnalyticsFilters): Observable<Blob> {
    return this.http.get(this.apiUrl, {
      params: this.toParams(filters),
      context: this.localLoaderContext,
      responseType: 'blob'
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
