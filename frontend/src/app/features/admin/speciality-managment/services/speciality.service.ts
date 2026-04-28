import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import {
  SpecialityResponse,
  SpecialityStatsResponse,
  AddSpecialityRequest,
  ProgramOption
} from '../models/speciality.model';

@Injectable({
  providedIn: 'root'
})
export class SpecialityService {
  private apiUrl = `${environment.apiUrl}admin/specialities`;
  private programsUrl = `${environment.apiUrl}admin/programs`;

  constructor(private http: HttpClient) {}

  getSpecialities(): Observable<SpecialityResponse[]> {
    return this.http.get<SpecialityResponse[]>(this.apiUrl);
  }

  getStats(): Observable<SpecialityStatsResponse> {
    return this.http.get<SpecialityStatsResponse>(`${this.apiUrl}/stats`);
  }

  getPrograms(): Observable<ProgramOption[]> {
    return this.http.get<ProgramOption[]>(this.programsUrl);
  }

  createSpeciality(programId: number, request: AddSpecialityRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/program/${programId}`, request);
  }

  updateSpeciality(id: number, request: AddSpecialityRequest): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, request);
  }

  updateSpecialityProgram(specialityId: number, programId: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/${specialityId}/program/${programId}`, {});
  }

  deleteSpeciality(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
