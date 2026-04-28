import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { GroupResponse, AddGroupRequest, GroupStatsResponse, AcademicClassOption } from '../models/group.model';

@Injectable({
  providedIn: 'root'
})
export class GroupService {
  private apiUrl = `${environment.apiUrl}admin/groups`;
  private classApiUrl = `${environment.apiUrl}admin/classes`;

  constructor(private http: HttpClient) {}

  getGroups(): Observable<GroupResponse[]> {
    return this.http.get<GroupResponse[]>(this.apiUrl);
  }

  getStats(): Observable<GroupStatsResponse> {
    return this.http.get<GroupStatsResponse>(`${this.apiUrl}/stats`);
  }

  getClasses(): Observable<AcademicClassOption[]> {
    return this.http.get<AcademicClassOption[]>(this.classApiUrl);
  }

  addGroup(req: AddGroupRequest): Observable<void> {
    return this.http.post<void>(this.apiUrl, req);
  }

  updateGroup(id: number, req: AddGroupRequest): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, req);
  }

  deleteGroup(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
