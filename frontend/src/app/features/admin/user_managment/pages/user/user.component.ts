import {Component, inject, OnInit} from '@angular/core';
import {UserService} from '../../service/user.service';
import {HeaderComponent} from '../../../../../shared/components/admin/header/header.component';
import {AddUserComponent} from '../../components/add-user/add-user.component';
import {StatisticsComponent} from '../../components/statistics/statistics.component';
import {UsersDataComponent} from '../../components/users-data/users-data.component';
import {ToastrService} from 'ngx-toastr';
import {
  BulkStatusChangeRequest,
  CreateUserRequest,
  Page,
  UpdateUserRequset,
  User,
  UserStats
} from '../../model/user.model';
import {SidebarComponent} from '../../../../../shared/components/admin/sidebar/sidebar.component';
import {RoleService} from '../../service/role.service';
import {CreateRoleRequest, Role} from '../../model/role.model';
import {ManageRolesComponent} from '../../components/manage-roles/manage-roles.component';

@Component({
  selector: 'app-user',
  imports: [
    HeaderComponent,
    AddUserComponent,
    ManageRolesComponent,
    StatisticsComponent,
    UsersDataComponent,
    SidebarComponent,
  ],
  templateUrl: './user.component.html',
  styleUrl: './user.component.scss',
})
export class UserComponent implements OnInit {
  private readonly userService = inject(UserService);
  private readonly roleService = inject(RoleService);
  private readonly toastr = inject(ToastrService);
  rolesList: Role[] = [];
  users!: Page<User>;
  role: string = '';
  keyword: string = '';
  selectedStatus: boolean | null = null;
  changedStatus: boolean = true;
  size = 5;
  page = 0;
  sort = "email,asc";
  isAddUserModalOpen: boolean = false;
  isManageRolesModalOpen: boolean = false;
  protected userStats!: UserStats;

  ngOnInit(): void {
    this.loadUsers();
    this.getAllRoles();

  }

  loadUserStats() {
    this.userService.loadUserStats().subscribe({
      next: (response) => {
        this.userStats = response;
      },
      error: (error) => {
        this.toastr.error("Failed to load user statistics.");
      }
    })
  }

  loadUsers() {
    this.userService.getUser(this.role, this.keyword, this.size, this.page, this.sort, this.selectedStatus).subscribe({
      next: (response) => {
        this.users = response;
        this.loadUserStats()
      },
      error: (error) => {
        this.toastr.error(error.error);
      }
    })
  }

  changeStatus(userId: number, newStatus: boolean) {
    this.userService.setUserStatus(userId, newStatus).subscribe({
      next: () => {
        this.toastr.success(`User  status changed successfully.`);
        this.loadUsers();
      },
      error: () => {
        this.toastr.error(`Failed to change status for user .`);
      }
    });
  }

  deleteUser(userId: number) {
    if (!confirm('Are you sure you want to delete this user?')) return;
    this.userService.deleteUser(userId).subscribe({
      next: () => {
        this.toastr.success(`User deleted successfully.`);
        this.loadUsers();
      },
      error: () => {
        this.toastr.error(`Failed to delete user.`);
      }
    });
  }

  protected onUserUpdated(user: UpdateUserRequset) {
    this.userService.updateUser(user).subscribe({
      next: () => {
        this.toastr.success(`User updated successfully.`);
        this.loadUsers();
      },
      error: () => {
        this.toastr.error(`Failed to update user.`);
      }
    });
  }

  protected onCreateUser(request: CreateUserRequest) {
    this.userService.createUser(request).subscribe({
      next: () => {
        this.toastr.success('User created successfully');
        this.isAddUserModalOpen = false;
        this.loadUsers();
      },
      error: (err) => {
        this.toastr.error('Failed to create user');
        console.error(err);
      }
    });
  }

  protected onCreateRole(request: CreateRoleRequest) {
    this.roleService.addRole(request).subscribe({
      next: () => {
        this.toastr.success('Role created successfully');
        this.getAllRoles();
      },
      error: (err) => {
        this.toastr.error('Failed to create role');
        console.error(err.error);
      }
    });
  }

  protected onUpdateRole(event: { id: number, request: CreateRoleRequest }) {
    this.roleService.updateRole(event.id, event.request).subscribe({
      next: () => {
        this.toastr.success('Role updated successfully');
        this.getAllRoles();
      },
      error: (err) => {
        this.toastr.error('Failed to update role. It may already exist.');
        console.error(err.error);
      }
    });
  }

  protected onDeleteRole(id: number) {
    this.roleService.deleteRole(id).subscribe({
      next: () => {
        this.toastr.success('Role deleted successfully');
        this.getAllRoles();
      },
      error: (err) => {
        this.toastr.error('Failed to delete role. It may be in use.');
        console.error(err.error);
      }
    });
  }

  protected getAllRoles() {
    this.roleService.getAllroles().subscribe({
      next: (response) => {
        this.rolesList = response;
        this.toastr.success('All roles successfully.');
      },
      error: (error) => {
        this.toastr.error('Failed to get  roles.');
      }
    })
  }


  protected getRole(role: string) {
    this.role = role;
    this.loadUsers();
  }

  protected getKeyword(keyword: string) {
    this.keyword = keyword;

    this.loadUsers();
  }

  protected onStatusSelected(status: boolean | null) {
    this.selectedStatus = status;
    this.loadUsers();

  }

  protected onSizeSelected(size: number) {
    this.size = size;
    this.loadUsers();

  }

  protected OnSelectedPage(page: number) {
    this.page = page;
    this.loadUsers();
  }

  protected onStatusChanged(status: { id: number; status: boolean }) {
    this.changedStatus = status.status;
    const userId = status.id;
    this.changeStatus(userId, this.changedStatus);

  }

  protected onUserDeleted(userId: number) {
    this.deleteUser(userId);
  }

  protected onBulkDelete(ids: number[]) {
    if (!confirm(`Are you sure you want to delete ${ids.length} selected users?`)) return;
    this.userService.bulkDeleteUsers(ids).subscribe({
      next: () => {
        this.toastr.success(`${ids.length} users deleted successfully.`);
        this.loadUsers();
      },
      error: () => {
        this.toastr.error('Failed to bulk delete users.');
      }
    });
  }

  protected onBulkStatusChanged(event: BulkStatusChangeRequest) {
    this.userService.bulkChangeStatus(event.ids, event.status).subscribe({
      next: () => {
        this.toastr.success(`Successfully updated status for ${event.ids.length} users.`);
        this.loadUsers();
      },
      error: () => {
        this.toastr.error('Failed to update bulk statuses.');
      }
    });
  }
}
