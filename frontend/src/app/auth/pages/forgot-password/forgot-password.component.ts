import {Component, inject} from '@angular/core';
import {FormBuilder, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';

import {RouterLink} from '@angular/router';
import {AuthService} from '../../auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-forgot-password',
  imports: [
    FormsModule,

    ReactiveFormsModule,
    RouterLink
  ],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss',
})
export class ForgotPasswordComponent {
  fb = inject(FormBuilder);
  toastService = inject(ToastrService)

  private authService = inject(AuthService);
  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
  });


  protected onSubmit() {

    if (this.form.invalid) {
      this.form.markAllAsTouched();

      return;
    }

    const request = this.form.getRawValue();

    this.authService.forgotPassword(request).subscribe({

      next: () => {
        this.toastService.info("If the email exists, you will receive instructions to reset your password.");

      },
      error: (err) => {
        this.toastService.error("If the email exists, you will receive instructions to reset your password.");

      }
    });

  }
}
