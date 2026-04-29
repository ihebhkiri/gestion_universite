import { Injectable } from '@angular/core';
import { HttpClient, HttpContext } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { SKIP_GLOBAL_LOADER } from '../../../../core/constant/loader-context';
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
  private readonly localLoaderContext = new HttpContext().set(SKIP_GLOBAL_LOADER, true);

  constructor(private http: HttpClient) {}

  getCourses(skipGlobalLoader = false): Observable<CourseResponse[]> {
    return this.http.get<CourseResponse[]>(this.apiUrl, {
      context: skipGlobalLoader ? this.localLoaderContext : undefined
    });
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

