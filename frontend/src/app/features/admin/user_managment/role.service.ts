import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import {CreateRoleRequest, Role, UpdateRoleRequest} from './model/role.model';

@Injectable({
  providedIn: 'root',
})
export class RoleService {
  private http = inject(HttpClient);
  getAllroles() {
    return this.http.get<Role[]>(`${environment.apiUrl}admin/roles`);
  }

  addRole(request: CreateRoleRequest) {
    return this.http.post<Role>(`${environment.apiUrl}admin/roles`, request);
  }

  updateRole(id: number, request: UpdateRoleRequest) {
    return this.http.put<Role>(`${environment.apiUrl}admin/roles/${id}`, request);
  }

  deleteRole(id: number) {
    return this.http.delete<void>(`${environment.apiUrl}admin/roles/${id}`);
  }

}
