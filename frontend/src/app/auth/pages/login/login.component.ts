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
  showPassword : boolean = false;
  toast = inject(ToastrService);
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

      next: () => {

        this.toast.success(this.message );
        this.router.navigate(['admin']) ;
      },
      error: (err) => {
        this.toast.error(err.error);
      }
    });

  }
  togglePassword(){
    this.showPassword=!this.showPassword;
  }
}
