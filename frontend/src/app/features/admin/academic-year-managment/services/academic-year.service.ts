import { Injectable } from '@angular/core';
import { HttpClient, HttpContext } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { SKIP_GLOBAL_LOADER } from '../../../../core/constant/loader-context';
import {
  AcademicYearResponse,
  AddAcademicYearRequest,
  AcademicYearStatsResponse
} from '../models/academic-year.model';

@Injectable({
  providedIn: 'root'
})
export class AcademicYearService {
  private apiUrl = `${environment.apiUrl}admin/academic-years`;
  private readonly localLoaderContext = new HttpContext().set(SKIP_GLOBAL_LOADER, true);

  constructor(private http: HttpClient) {}

  getAll(skipGlobalLoader = false): Observable<AcademicYearResponse[]> {
    return this.http.get<AcademicYearResponse[]>(this.apiUrl, {
      context: skipGlobalLoader ? this.localLoaderContext : undefined
    });
  }

  getStats(): Observable<AcademicYearStatsResponse> {
    return this.http.get<AcademicYearStatsResponse>(`${this.apiUrl}/stats`);
  }

  create(req: AddAcademicYearRequest): Observable<void> {
    return this.http.post<void>(this.apiUrl, req);
  }

  update(id: number, req: AddAcademicYearRequest): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, req);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}

