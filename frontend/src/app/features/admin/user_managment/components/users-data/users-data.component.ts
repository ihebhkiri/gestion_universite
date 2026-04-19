import {Component, EventEmitter, inject, Input, Output, OnChanges, SimpleChanges} from '@angular/core';
import {BulkStatusChangeRequest, Page, UpdateUserRequset, User} from '../../model/user.model';
import {DatePipe, NgClass} from '@angular/common';
import {FormArray, FormBuilder, FormControl, ReactiveFormsModule, Validators} from '@angular/forms';
import {Role} from '../../model/role.model';

@Component({
  selector: 'app-users-data',
  imports: [
    DatePipe,
    NgClass,
    ReactiveFormsModule
  ],
  templateUrl: './users-data.component.html',
  styleUrl: './users-data.component.scss',
})
export class UsersDataComponent implements OnChanges {
  private readonly fb = inject(FormBuilder);


  @Input() userss!: Page<User>;
  @Input() roleList: Role[] = [];
  formatRolesList(role: Role) {
    return role.name.replace("ROLE_", "");
  }


  role: string = '';
  keyword: string = '';
  @Output() roleChange = new EventEmitter<string>();
  @Output() keywordChange = new EventEmitter<string>();
  @Output() statusSelected = new EventEmitter<boolean | null>();
  @Output() sizeSelected = new EventEmitter<number>();
  @Output() pageSelected = new EventEmitter<number>();
  @Output() statusChanged = new EventEmitter<{ id: number, status: boolean }>();
  @Output() userDeleted = new EventEmitter<number>();
  @Output() userUpdated = new EventEmitter<UpdateUserRequset>();
  @Output() bulkDeleteEvent = new EventEmitter<number[]>();
  @Output() bulkStatusEvent = new EventEmitter<BulkStatusChangeRequest>();

  selectedUser: User | null = null;
  selectedUserIds: Set<number> = new Set<number>();

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['userss']) {
      this.clearSelection();
    }
  }

  isAllSelected(): boolean {
    return this.userss?.content?.length > 0 && this.selectedUserIds.size === this.userss.content.length;
  }

  toggleAll(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.checked) {
      this.userss.content.forEach(user => this.selectedUserIds.add(user.id));
    } else {
      this.clearSelection();
    }
  }

  toggleSelection(userId: number, event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.checked) {
      this.selectedUserIds.add(userId);
    } else {
      this.selectedUserIds.delete(userId);
    }
  }

  clearSelection(): void {
    this.selectedUserIds.clear();
  }

  triggerBulkDelete(): void {
    this.bulkDeleteEvent.emit(Array.from(this.selectedUserIds));
    this.clearSelection();
  }

  triggerBulkStatus(status: boolean): void {

    this.bulkStatusEvent.emit({ ids: Array.from(this.selectedUserIds), status });
    this.clearSelection();
  }

  formatRoles(roles: String[]) {
    return roles.map(role => role.replace('ROLE_', '')).join(', ');
  }

  protected onSelectRole(event: Event) {
    const result = event.target as HTMLSelectElement;
    this.role = result.value;
    this.roleChange.emit(this.role);
  }

  protected onSearch(event: Event) {
    const result = event.target as HTMLSelectElement;
    this.keyword = result.value;
    this.keywordChange.emit(this.keyword);
  }

  protected onSelectStatus(event: Event) {
    const input = event.target as HTMLSelectElement;
    const value = input.value;
    const status: boolean | null = value === '' ? null : value === 'true';
    this.statusSelected.emit(status);
  }

  protected onSizeChange(event: Event) {
    const input = event.target as HTMLSelectElement;
    const size: number = Number(input.value);
    this.sizeSelected.emit(size);

  }

  getPages(): number[] {
    return Array.from({length: this.userss?.totalPages ?? 0}, (_, i) => i);
  }

  protected onPageSelect(page: number) {
    this.pageSelected.emit(page);

  }

  protected onNext() {
    if (!this.userss.last) {
      this.pageSelected.emit(this.userss.number + 1);
    }

  }

  protected onPrevious() {
    if (!this.userss.first) {
      this.pageSelected.emit(this.userss.number - 1);
    }
  }

  protected getStart(): number {
    return this.userss.number * this.userss.size + 1;
  }

  protected getEnd(): number {
    return this.getStart() + this.userss.numberOfElements - 1;
  }

  protected onChangeStatus(isEnabled: boolean, userId: number) {
    this.statusChanged.emit({id: userId, status: isEnabled});


  }

  protected deleteUser(id: number) {
    this.userDeleted.emit(id);

  }

  modal: boolean = false;

  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    roles: this.fb.array<FormControl<string>>([], Validators.required)
  });

  private getRolesArray(): FormArray {
    return this.form.get('roles') as FormArray;
  }

  openEditModal(user: User) {
    const rolesArray = this.getRolesArray();
    this.selectedUser = user;
    this.form.patchValue({email: user.email});
    rolesArray.clear();
    const roleNames = user.roles.map(r => r.replace('ROLE_', ''));
    roleNames.forEach(role => rolesArray.push(new FormControl(role)));
    this.modal = true;
  }

  closeModal() {
    this.getRolesArray().clear();
    this.form.reset();
    this.modal = false;
  }

  hasRole(role: string): boolean {
    const roles = this.form.get('roles')?.value || [];
    return roles.includes(role);
  }

  onSubmit() {
    if (this.form.valid && this.selectedUser) {

      const {email, roles} = this.form.getRawValue();
      const updateUserData = {
        id: this.selectedUser.id,
        email: email ?? '',
        roleNames: roles ?? []
      };
      this.userUpdated.emit(updateUserData);
      this.closeModal();
    }
  }

  protected onChange(event: any) {
    const roles = this.getRolesArray();
    if (!roles) return;
    const input = event.target as HTMLInputElement;
    const value = input.value;

    if (input.checked) {
      if (!roles.value.includes(value)) {
        roles.push(this.fb.control(value));
      }
    } else {
      const index = roles.controls.findIndex(x => x.value === value);
      if (index >= 0) {
        roles.removeAt(index);
      }
    }
  }
}
