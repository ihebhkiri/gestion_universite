import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
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

  constructor(private http: HttpClient) {}

  getAll(): Observable<AcademicYearResponse[]> {
    return this.http.get<AcademicYearResponse[]>(this.apiUrl);
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

