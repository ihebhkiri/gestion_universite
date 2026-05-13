import { HttpClient, HttpContext } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { SKIP_GLOBAL_LOADER } from '../../../core/constant/loader-context';
import { environment } from '../../../../environments/environment';
import { StudentRecentGrade, StudentResultsResponse } from '../models/student-results.model';

@Injectable({
  providedIn: 'root',
})
export class StudentResultsService {
  private readonly http = inject(HttpClient);
  private readonly resultsUrl = `${environment.apiUrl}students/me/results`;
  private readonly localLoaderContext = new HttpContext().set(SKIP_GLOBAL_LOADER, true);

  getMyResults(): Observable<StudentResultsResponse> {
    return this.http.get<StudentResultsResponse>(this.resultsUrl, {
      context: this.localLoaderContext,
    });
  }

  getLatestGrades(limit = 5): Observable<StudentRecentGrade[]> {
    return this.getMyResults().pipe(
      map((response) => (response.recentGrades ?? []).slice(0, limit)),
    );
  }
}
