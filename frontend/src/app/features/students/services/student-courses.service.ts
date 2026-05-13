import { HttpClient, HttpContext, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { SKIP_GLOBAL_LOADER } from '../../../core/constant/loader-context';
import { environment } from '../../../../environments/environment';
import { StudentCourse, StudentCourseQueryParams, StudentPage } from '../models/student-course.model';

@Injectable({
  providedIn: 'root',
})
export class StudentCoursesService {
  private readonly http = inject(HttpClient);
  private readonly coursesUrl = `${environment.apiUrl}students/me/courses`;
  private readonly localLoaderContext = new HttpContext().set(SKIP_GLOBAL_LOADER, true);

  getMyCourses(params: StudentCourseQueryParams): Observable<StudentPage<StudentCourse>> {
    return this.http.get<StudentPage<StudentCourse>>(this.coursesUrl, {
      params: this.buildParams(params),
      context: this.localLoaderContext,
    });
  }

  getLatestCourses(limit = 5): Observable<StudentCourse[]> {
    return this.getMyCourses({
      page: 0,
      size: limit,
      sort: 'publishedAt,desc',
    }).pipe(
      map((page) => page.content),
    );
  }

  private buildParams(query: StudentCourseQueryParams): HttpParams {
    let params = new HttpParams()
      .set('page', query.page)
      .set('size', query.size);

    if (query.period) {
      params = params.set('period', query.period);
    }

    if (query.teacherId) {
      params = params.set('teacherId', query.teacherId);
    }

    if (query.subjectId) {
      params = params.set('subjectId', query.subjectId);
    }

    if (query.sort) {
      params = params.set('sort', query.sort);
    }

    return params;
  }
}
