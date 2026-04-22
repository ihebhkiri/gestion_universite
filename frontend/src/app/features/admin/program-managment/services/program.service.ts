import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import {
  ProgramResponse,
  ProgramStatsResponse,
  AddProgramRequest,
  DepartmentOption
} from '../models/program.model';

@Injectable({
  providedIn: 'root'
})
export class ProgramService {
  private apiUrl = `${environment.apiUrl}admin/programs`;
  private departmentsUrl = `${environment.apiUrl}admin/departments`;

  constructor(private http: HttpClient) {}

  getPrograms(): Observable<ProgramResponse[]> {
    return this.http.get<ProgramResponse[]>(this.apiUrl);
  }

  getStats(): Observable<ProgramStatsResponse> {
    return this.http.get<ProgramStatsResponse>(`${this.apiUrl}/stats`);
  }

  getDepartments(): Observable<DepartmentOption[]> {
    return this.http.get<DepartmentOption[]>(this.departmentsUrl);
  }

  createProgram(departmentId: number, request: AddProgramRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/department/${departmentId}`, request);
  }

  updateProgram(id: number, request: AddProgramRequest): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, request);
  }

  updateProgramDepartment(programId: number, departmentId: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/${programId}/department/${departmentId}`, {});
  }

  deleteProgram(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
