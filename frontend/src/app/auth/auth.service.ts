import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { LoginRequest } from './models/auth.model';
import { environment } from '../../environments/environment';
import { ResetPasswordRequest } from './models/ResetPasswordRequest.model';
import { switchMap } from 'rxjs';
import { Me } from './models/Me.model';


@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient)
  login(request: LoginRequest) {
    return this.http.post<Me>(`${environment.apiUrl}auth/login`, request).pipe(
      switchMap(() => this.getUserInfo())
    );
  }

  getUserInfo() {
    return this.http.get<Me>(`${environment.apiUrl}auth/me`)
  }

  forgotPassword(request: { email: string }) {
    return this.http.post<void>(`${environment.apiUrl}auth/forgot-password`, request);
  }

  logout() {
    return this.http.post<void>(`${environment.apiUrl}auth/logout`, {});
  }

  resetPassword(request: ResetPasswordRequest) {
    return this.http.post<void>(`${environment.apiUrl}auth/reset-password`, request);
  }
}
