import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import {
  AddCourseRequest,
  BulkDeleteCoursesRequest,
  CourseResponse,
  CourseStatsResponse
} from '../models/course.model';

@Injectable({
  providedIn: 'root'
})
export class CourseService {
  private apiUrl = `${environment.apiUrl}admin/courses`;

  constructor(private http: HttpClient) {}

  getCourses(): Observable<CourseResponse[]> {
    return this.http.get<CourseResponse[]>(this.apiUrl);
  }

  getStats(): Observable<CourseStatsResponse> {
    return this.http.get<CourseStatsResponse>(`${this.apiUrl}/stats`);
  }

  create(request: AddCourseRequest): Observable<void> {
    return this.http.post<void>(this.apiUrl, request);
  }

  update(id: number, request: AddCourseRequest): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, request);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  bulkDelete(request: BulkDeleteCoursesRequest): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/bulk-delete`, request);
  }
}

