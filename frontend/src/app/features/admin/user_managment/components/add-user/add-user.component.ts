import {Component, EventEmitter, Output, inject, Input} from '@angular/core';
import {FormBuilder, FormGroup, Validators, FormArray, FormControl, ReactiveFormsModule} from '@angular/forms';
import {ToastrService} from 'ngx-toastr';
import {CreateUserRequest} from '../../model/user.model';
import {Role} from '../../model/role.model';

@Component({
  selector: 'app-add-user',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './add-user.component.html',
  styleUrl: './add-user.component.scss',
})
export class AddUserComponent {
  @Output() closeModal = new EventEmitter<void>();
  @Output() createUser = new EventEmitter<CreateUserRequest>();

  private fb = inject(FormBuilder);
  private toastr = inject(ToastrService);
  showPassword: boolean = false;

  @Input({required:true}) rolesList : Role[] = [];
  formatRolesList(role: Role) {
    return role.name.replace("ROLE_", "");
  }

  addUserForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    roles: this.fb.array<FormControl<string[]>>([])
  });

  get rolesFormArray() {
    return this.addUserForm.get('roles') as FormArray;
  }

  onRoleChange(role: Event) {

    const roles = this.rolesFormArray;
    if (!roles) return;
    const input = role.target as HTMLInputElement;
    const value = input.value;
    if (input.checked) {
      if (!roles.value.includes(value)) {
        roles.push(this.fb.control(value))
      }
    } else {
      const index = roles.controls.findIndex(x => x.value === value);
      if (index >= 0) {
        roles.removeAt(index);
      }
    }

  }

  onSubmit() {
    if (this.addUserForm.invalid) {
      this.addUserForm.markAllAsTouched();
      return;
    }

    const rolesSet = this.addUserForm.value.roles;
    if (rolesSet.length === 0) {
      this.toastr.warning('Please select at least one role');
      return;
    }
const {email ,password } = this.addUserForm.getRawValue();


    const request: CreateUserRequest = {
      email: email,
      password: password,
      roleNames: rolesSet
    };

    this.createUser.emit(request);
  }

  onCancel() {
    this.closeModal.emit();
  }

  protected togglePassword() {
    this.showPassword = !this.showPassword
  }
}
