import { Injectable } from '@angular/core';
import { HttpClient, HttpContext } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { SKIP_GLOBAL_LOADER } from '../../../../core/constant/loader-context';
import {
  AcademicYearOption,
  AddSemesterRequest,
  SemesterResponse,
  SemesterStatsResponse
} from '../models/semester.model';

@Injectable({
  providedIn: 'root'
})
export class SemesterService {
  private apiUrl = `${environment.apiUrl}admin/semesters`;
  private academicYearsUrl = `${environment.apiUrl}admin/academic-years`;
  private readonly localLoaderContext = new HttpContext().set(SKIP_GLOBAL_LOADER, true);

  constructor(private http: HttpClient) {}

  getSemesters(skipGlobalLoader = false): Observable<SemesterResponse[]> {
    return this.http.get<SemesterResponse[]>(this.apiUrl, {
      context: skipGlobalLoader ? this.localLoaderContext : undefined
    });
  }

  getStats(): Observable<SemesterStatsResponse> {
    return this.http.get<SemesterStatsResponse>(`${this.apiUrl}/stats`);
  }

  getAcademicYears(): Observable<AcademicYearOption[]> {
    return this.http.get<AcademicYearOption[]>(this.academicYearsUrl);
  }

  create(request: AddSemesterRequest): Observable<void> {
    return this.http.post<void>(this.apiUrl, request);
  }

  update(id: number, request: AddSemesterRequest): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, request);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}

