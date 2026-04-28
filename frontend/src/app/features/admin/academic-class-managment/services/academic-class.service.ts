import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import {
  AcademicClassResponse,
  AcademicClassStatsResponse,
  AddAcademicClassRequest,
  AcademicYearOption,
  ProgramOption,
  SpecialityOption
} from '../models/academic-class.model';

@Injectable({
  providedIn: 'root'
})
export class AcademicClassService {
  private apiUrl = `${environment.apiUrl}admin/classes`;
  private programsUrl = `${environment.apiUrl}admin/programs`;
  private specialitiesUrl = `${environment.apiUrl}admin/specialities`;
  private academicYearsUrl = `${environment.apiUrl}admin/academic-years`;

  constructor(private http: HttpClient) {}

  getClasses(): Observable<AcademicClassResponse[]> {
    return this.http.get<AcademicClassResponse[]>(this.apiUrl);
  }

  getStats(): Observable<AcademicClassStatsResponse> {
    return this.http.get<AcademicClassStatsResponse>(`${this.apiUrl}/stats`);
  }

  getPrograms(): Observable<ProgramOption[]> {
    return this.http.get<ProgramOption[]>(this.programsUrl);
  }

  getSpecialities(): Observable<SpecialityOption[]> {
    return this.http.get<SpecialityOption[]>(this.specialitiesUrl);
  }

  getAcademicYears(): Observable<AcademicYearOption[]> {
    return this.http.get<AcademicYearOption[]>(this.academicYearsUrl);
  }

  createClass(request: AddAcademicClassRequest): Observable<void> {
    return this.http.post<void>(this.apiUrl, request);
  }

  updateClass(id: number, request: AddAcademicClassRequest): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, request);
  }

  deleteClass(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
