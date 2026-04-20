import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../../../environments/environment';
import {
  AddSubjectRequest,
  AddTeacherRequest,
  Department,
  Subject,
  Teacher,
  UpdateTeacherRequest
} from '../models/teaching.model';

@Injectable({
  providedIn: 'root'
})
export class TeachingService {
  private readonly http = inject(HttpClient);

  getTeachers() {
    return this.http.get<Teacher[]>(`${environment.apiUrl}admin/teachers`);
  }

  createTeacher(request: AddTeacherRequest) {
    return this.http.post<void>(`${environment.apiUrl}admin/teachers`, request);
  }

  updateTeacher(id: number, request: UpdateTeacherRequest) {
    return this.http.put<void>(`${environment.apiUrl}admin/teachers/${id}`, request);
  }

  deleteTeacher(id: number) {
    return this.http.delete<void>(`${environment.apiUrl}admin/teachers/${id}`);
  }

  getSubjects() {
    return this.http.get<Subject[]>(`${environment.apiUrl}admin/subjects`);
  }

  createSubject(request: AddSubjectRequest) {
    return this.http.post<Subject>(`${environment.apiUrl}admin/subjects`, request);
  }

  updateSubject(id: number, request: AddSubjectRequest) {
    return this.http.put<Subject>(`${environment.apiUrl}admin/subjects/${id}`, request);
  }

  deleteSubject(id: number) {
    return this.http.delete<void>(`${environment.apiUrl}admin/subjects/${id}`);
  }

  getDepartments() {
    return this.http.get<Department[]>(`${environment.apiUrl}admin/departments`);
  }
}
