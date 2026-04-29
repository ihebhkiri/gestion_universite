import {HttpClient, HttpContext, HttpParams} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {environment} from '../../../../../environments/environment';
import {SKIP_GLOBAL_LOADER} from '../../../../core/constant/loader-context';
import {TimetableEntryRequest, TimetableEntryResponse, TimetableFilters} from '../models/timetable.model';

@Injectable({
  providedIn: 'root'
})
export class TimetableService {
  private readonly apiUrl = `${environment.apiUrl}admin/timetable`;
  private readonly localLoaderContext = new HttpContext().set(SKIP_GLOBAL_LOADER, true);

  constructor(private readonly http: HttpClient) {}

  getEntries(filters: TimetableFilters): Observable<TimetableEntryResponse[]> {
    let params = new HttpParams();
    if (filters.classId) params = params.set('classId', filters.classId);
    if (filters.semesterId) params = params.set('semesterId', filters.semesterId);
    return this.http.get<TimetableEntryResponse[]>(this.apiUrl, {
      params,
      context: this.localLoaderContext
    });
  }

  create(request: TimetableEntryRequest): Observable<TimetableEntryResponse> {
    return this.http.post<TimetableEntryResponse>(this.apiUrl, request, {context: this.localLoaderContext});
  }

  update(id: number, request: TimetableEntryRequest): Observable<TimetableEntryResponse> {
    return this.http.put<TimetableEntryResponse>(`${this.apiUrl}/${id}`, request, {context: this.localLoaderContext});
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, {context: this.localLoaderContext});
  }
}
