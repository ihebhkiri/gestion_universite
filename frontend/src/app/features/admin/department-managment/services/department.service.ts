import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import {
  DepartmentResponse,
  DepartmentStatsResponse,
  AddDepartmentRequest
} from '../models/department.model';

@Injectable({
  providedIn: 'root'
})
export class DepartmentService {
  private apiUrl = `${environment.apiUrl}admin/departments`;

  constructor(private http: HttpClient) {}

  getDepartments(): Observable<DepartmentResponse[]> {
    return this.http.get<DepartmentResponse[]>(this.apiUrl);
  }

  getStats(): Observable<DepartmentStatsResponse> {
    return this.http.get<DepartmentStatsResponse>(`${this.apiUrl}/stats`);
  }

  createDepartment(request: AddDepartmentRequest): Observable<any> {
    return this.http.post(this.apiUrl, request);
  }

  updateDepartment(id: number, request: AddDepartmentRequest): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, request);
  }

  deleteDepartment(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
