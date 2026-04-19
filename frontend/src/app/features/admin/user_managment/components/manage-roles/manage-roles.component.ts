import {Component, EventEmitter, Input, Output, inject} from '@angular/core';
import {FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule} from '@angular/forms';
import {CreateRoleRequest, Role} from '../../model/role.model';
import {CommonModule} from '@angular/common';

@Component({
  selector: 'app-manage-roles',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, FormsModule],
  templateUrl: './manage-roles.component.html',
  styleUrl: './manage-roles.component.scss',
})
export class ManageRolesComponent {
  @Input({required: true}) rolesList: Role[] = [];

  @Output() closeModal = new EventEmitter<void>();
  @Output() createRole = new EventEmitter<CreateRoleRequest>();
  @Output() updateRole = new EventEmitter<{id: number, request: CreateRoleRequest}>();
  @Output() deleteRole = new EventEmitter<number>();

  private fb = inject(FormBuilder);

  addRoleForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
  });

  editingRoleId: number | null = null;
  editRoleName: string = '';

  formatRoleName(name: string) {
    return name;
  }

  onSubmit() {
    if (this.addRoleForm.invalid) {
      this.addRoleForm.markAllAsTouched();
      return;
    }

    const { name } = this.addRoleForm.getRawValue();

    const request: CreateRoleRequest = {
      name: name
    };

    this.createRole.emit(request);
    this.addRoleForm.reset();
  }

  startEdit(role: Role) {
    this.editingRoleId = role.id;
    this.editRoleName = role.name.replace("ROLE_", "");
  }

  cancelEdit() {
    this.editingRoleId = null;
    this.editRoleName = '';
  }

  saveEdit(id: number) {
    if (!this.editRoleName || this.editRoleName.trim().length < 2) return;

    this.updateRole.emit({
      id,
      request: { name: this.editRoleName }
    });
    this.editingRoleId = null;
  }

  onDelete(id: number) {
    if(confirm("Are you sure you want to delete this role?")) {
      this.deleteRole.emit(id);
    }
  }

  onCancel() {
    this.closeModal.emit();
  }
}
