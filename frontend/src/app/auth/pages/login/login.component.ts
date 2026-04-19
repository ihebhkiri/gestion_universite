import {Component, inject, signal} from '@angular/core';
import {FormBuilder, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {AuthService} from '../../auth.service';
import {Router, RouterLink} from '@angular/router';
import {CommonModule} from '@angular/common';
import {ToastrService} from 'ngx-toastr';

@Component({
  selector: 'app-login',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    CommonModule, FormsModule, RouterLink,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  message = "Login successful";
  showPassword: boolean = false;
  toastr = inject(ToastrService);
  fb = inject(FormBuilder);
  router = inject(Router);
  private authService = inject(AuthService);
  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });


  protected onSubmit() {

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const request = this.form.getRawValue();

    this.authService.login(request).subscribe({

      next: (user) => {

        this.toastr.success(this.message);
        if (user.roles.includes("ROLE_ADMIN")) {
          this.router.navigate(['/admins'])
        }
        if (user.roles.includes("ROLE_STUDENT")) {
          this.router.navigate(['/students'])
        }
        if (user.roles.includes("ROLE_TEACHER")) {
          this.router.navigate(['/teachers'])
        }
        ;
      },
      error: (err) => {
        this.toastr.error(err.error);
      }
    });

  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }
}
