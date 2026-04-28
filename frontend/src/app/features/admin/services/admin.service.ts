import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { AdminDashboardResponse } from '../models/dashboard.model';

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  private readonly apiUrl = `${environment.apiUrl}admin/dashboard`;

  constructor(private readonly http: HttpClient) {}

  getDashboard(): Observable<AdminDashboardResponse> {
    return this.http.get<AdminDashboardResponse>(this.apiUrl);
  }
}
