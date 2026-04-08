import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {LoginRequest} from './models/auth.model';
import {UserInfo} from './models/UserInfo.model';
import {environment} from '../../environments/environment';
import {ResetPasswordRequest} from './models/ResetPasswordRequest.model';

interface GoogleAuthRequest {
  token:string
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
 private  http = inject(HttpClient)
  login (request:LoginRequest) {
    return this.http.post<void>(`${environment.apiUrl}auth/login` , request);
  }

  getUserInfo() {
    return this.http.get<UserInfo>(`${environment.apiUrl}users/me`)
  }

  forgotPassword(request: {email: string}) {
    return this.http.post<void>(`${environment.apiUrl}auth/forgot-password`, request);
  }

  resetPassword(request: ResetPasswordRequest) {
    return this.http.post<void>(`${environment.apiUrl}auth/reset-password`, request);
  }
}
