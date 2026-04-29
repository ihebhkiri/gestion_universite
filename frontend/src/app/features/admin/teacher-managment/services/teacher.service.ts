import {HttpClient, HttpContext, HttpParams} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {environment} from '../../../../../environments/environment';
import {SKIP_GLOBAL_LOADER} from '../../../../core/constant/loader-context';
import {
  AddTeacherRequest,
  AssignTeacherRequest,
  PageableResponse,
  TeacherFilters,
  TeacherResponse,
  TeacherSort,
  UpdateTeacherRequest
} from '../models/teacher.model';

@Injectable({
  providedIn: 'root'
})
export class TeacherService {
  private readonly apiUrl = `${environment.apiUrl}admin/teachers`;

  constructor(private readonly http: HttpClient) {
  }

  private readonly localLoaderContext = new HttpContext().set(SKIP_GLOBAL_LOADER, true);

  getTeachers(page: number, size: number, filters: TeacherFilters, sort: TeacherSort): Observable<PageableResponse<TeacherResponse>> {
    let params = new HttpParams()
      .set('page', page)
      .set('size', size)
      .set('sort', `${sort.active},${sort.direction}`);

    if (filters.search) params = params.set('search', filters.search);
    if (filters.department) params = params.set('department', filters.department);
    if (filters.status) params = params.set('status', filters.status);
    if (filters.subject) params = params.set('subject', filters.subject);
    if (filters.speciality) params = params.set('speciality', filters.speciality);
    if (filters.hiredFrom) params = params.set('hiredFrom', filters.hiredFrom);
    if (filters.hiredTo) params = params.set('hiredTo', filters.hiredTo);

    return this.http.get<PageableResponse<TeacherResponse>>(this.apiUrl, {
      params,
      context: this.localLoaderContext
    });
  }

  getTeacher(id: number): Observable<TeacherResponse> {
    return this.http.get<TeacherResponse>(`${this.apiUrl}/${id}`, {context: this.localLoaderContext});
  }

  getAllTeachers(): Observable<TeacherResponse[]> {
    return this.http.get<TeacherResponse[]>(`${this.apiUrl}/all`, {context: this.localLoaderContext});
  }

  createTeacher(request: AddTeacherRequest): Observable<void> {
    return this.http.post<void>(this.apiUrl, request, {context: this.localLoaderContext});
  }

  updateTeacher(id: number, request: UpdateTeacherRequest): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, request, {context: this.localLoaderContext});
  }

  deleteTeacher(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, {context: this.localLoaderContext});
  }

  batchDelete(teacherIds: number[]): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/batch`, {
      body: {teacherIds},
      context: this.localLoaderContext
    });
  }

  assignTeacher(teacherId: number, request: AssignTeacherRequest): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${teacherId}/assignments`, request, {context: this.localLoaderContext});
  }
}
