import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../../environments/environment';
import {Observable} from 'rxjs';
import {StudentProfile} from '../models/student-profile.model';

@Injectable({
  providedIn: 'root',
})
export class StudentsService {
  private readonly http = inject(HttpClient);
  private readonly profileUrl = `${environment.apiUrl}students/me/profile`;

  getProfile(): Observable<StudentProfile> {
    return this.http.get<StudentProfile>(this.profileUrl);
  }

}
