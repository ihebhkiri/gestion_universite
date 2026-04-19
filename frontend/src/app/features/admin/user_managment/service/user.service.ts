import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../../../environments/environment';
import {Page, UpdateUserRequset, User, CreateUserRequest, UserStats} from '../model/user.model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly http = inject(HttpClient);

  getUser(role: String, keyword: String, size: number, page: number, sort: string, status: boolean | null) {
    let url = `${environment.apiUrl}admin/users?page=${page}&size=${size}&role=${role}&email=${keyword}&sort=${sort}`;
    if (status !== null) {
      url += `&status=${status}`;
    }
    return this.http.get<Page<User>>(url);

  }

  setUserStatus(userId: number, enabled: boolean) {
    return this.http.patch(`${environment.apiUrl}admin/users/${userId}/status`, {enabled});
  }

  deleteUser(userId: number) {
    return this.http.delete(`${environment.apiUrl}admin/users/${userId}`);
  }

  updateUser(user: UpdateUserRequset) {
    return this.http.put(`${environment.apiUrl}admin/users/${user.id}`, user);
  }

  createUser(user: CreateUserRequest) {
    return this.http.post(`${environment.apiUrl}admin/users`, user);
  }

  loadUserStats() {
    return this.http.get<UserStats>(`${environment.apiUrl}admin/users/stats`);
  }

  bulkDeleteUsers(ids: number[]) {
    return this.http.delete(`${environment.apiUrl}admin/users/bulk`, {body: ids});
  }

  bulkChangeStatus(ids: number[], enabled: boolean) {
    return this.http.patch(`${environment.apiUrl}admin/users/bulk/status`, {ids, enabled});
  }
}
