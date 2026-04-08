import {Component, inject, Input} from '@angular/core';
import {FormBuilder, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {Router, RouterLink} from '@angular/router';
import {AuthService} from '../../auth.service';

import {ResetPasswordRequest} from '../../models/ResetPasswordRequest.model';
import {passwordMatchValidator} from '../../validators/passwordMatchValidator';
import {ToastrService} from 'ngx-toastr';


@Component({
  selector: 'app-reset-passwrod',
  imports: [
    FormsModule,

    ReactiveFormsModule,
    RouterLink
  ],
  templateUrl: './reset-passwrod.component.html',
  styleUrl: './reset-passwrod.component.scss',
})
export class ResetPasswrodComponent {
  toastService = inject(ToastrService);
  fb = inject(FormBuilder);
  router = inject(Router);
  private authService = inject(AuthService);
  @Input() token!: string;
  showPassword: boolean = false;
  form = this.fb.nonNullable.group({
    confirmPassword: ['', [Validators.required]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  }, {validators: passwordMatchValidator});


  protected onSubmit() {

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      console.log("invalid form");
      return;
    }

    const request: ResetPasswordRequest = {password: this.form.getRawValue().password,confirmPassword:this.form.getRawValue().confirmPassword, token: this.token};

    this.authService.resetPassword(request).subscribe({

      next: (res) => {
       this.toastService.success("Password Updated Successfully.") ;
       this.router.navigate(['/auth']);
      },
      error: (err) => {
        this.toastService.error(err.error);
      }
    });

  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }


}
