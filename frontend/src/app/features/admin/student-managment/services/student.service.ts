import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import {
  StudentResponse,
  StudentStatsResponse,
  AddStudentRequest,
  UpdateStudentRequest,
  PageableResponse
} from '../models/student.model';

export interface BulkDeleteStudentsRequest {
  studentIds: number[];
}

@Injectable({
  providedIn: 'root'
})
export class StudentService {
  private apiUrl = `${environment.apiUrl}admin/students`;

  constructor(private http: HttpClient) {}

  getStudents(keyword: string = '', page: number = 0, size: number = 10): Observable<PageableResponse<StudentResponse>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (keyword) {
      params = params.set('keyword', keyword);
    }

    return this.http.get<PageableResponse<StudentResponse>>(this.apiUrl, { params });
  }

  getStudentStats(): Observable<StudentStatsResponse> {
    return this.http.get<StudentStatsResponse>(`${this.apiUrl}/stats`);
  }

  getStudentById(id: number): Observable<StudentResponse> {
    return this.http.get<StudentResponse>(`${this.apiUrl}/${id}`);
  }

  addStudent(student: AddStudentRequest, image?: File): Observable<any> {
    const formData = new FormData();
    formData.append('student', new Blob([JSON.stringify(student)], { type: 'application/json' }));

    if (image) {
      formData.append('image', image);
    }

    return this.http.post(this.apiUrl, formData);
  }

  updateStudent(id: number, student: UpdateStudentRequest): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, student);
  }

  deleteStudent(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  bulkDelete(request: BulkDeleteStudentsRequest): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/bulk-delete`, request);
  }

  uploadImage(id: number, image: File): Observable<any> {
    const formData = new FormData();
    formData.append('image', image);
    return this.http.post(`${this.apiUrl}/${id}/image`, formData);
  }
}
