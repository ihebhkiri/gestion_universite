import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { EnrollStudentRequest, ChangeEnrollmentStatusRequest, EnrollmentResponse } from '../models/enrollment.model';

@Injectable({
  providedIn: 'root'
})
export class EnrollmentService {
  private apiUrl = `${environment.apiUrl}admin/enrollments`;

  constructor(private http: HttpClient) {}

  enrollStudentToGroup(groupId: number, request: EnrollStudentRequest): Observable<any> {
    return this.http.post(`${environment.apiUrl}admin/groups/${groupId}/enrollments`, request);
  }


  changeEnrollmentStatus(enrollmentId: number, status: string): Observable<any> {
    const req: ChangeEnrollmentStatusRequest = { newStatus: status };
    return this.http.post(`${environment.apiUrl}admin/enrollments/${enrollmentId}/status`, req);
  }

  bulkChangeEnrollmentStatus(studentIds: number[], status: string): Observable<void> {
    return this.http.post<void>(`${environment.apiUrl}admin/enrollments/status/bulk`, {
      studentIds,
      newStatus: status
    });
  }
}
