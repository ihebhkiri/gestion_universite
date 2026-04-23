import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from '../../../../../environments/environment';
import {AddSubjectRequest, SubjectResponse} from '../models/subject.model';

@Injectable({
  providedIn: 'root'
})
export class SubjectService {
  private apiUrl = `${environment.apiUrl}admin/subjects`;

  constructor(private http: HttpClient) {}

  getSubjects(): Observable<SubjectResponse[]> {
    return this.http.get<SubjectResponse[]>(this.apiUrl);
  }


  createSubject(request: AddSubjectRequest): Observable<void> {
    return this.http.post<void>(this.apiUrl, request);
  }

  updateSubject(id: number, request: AddSubjectRequest): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, request);
  }

  deleteSubject(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
