import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
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

  constructor(private http: HttpClient) {}

  getSemesters(): Observable<SemesterResponse[]> {
    return this.http.get<SemesterResponse[]>(this.apiUrl);
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

