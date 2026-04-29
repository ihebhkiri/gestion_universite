import {ErrorHandler, Injectable, inject} from '@angular/core';
import {HttpErrorResponse} from '@angular/common/http';
import {ToastrService} from 'ngx-toastr';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  private readonly toastr = inject(ToastrService);

  handleError(error: unknown): void {
    if (error instanceof HttpErrorResponse && error.status === 409) {
      this.toastr.error(typeof error.error === 'string' ? error.error : 'Schedule conflict detected.');
      return;
    }

    console.error(error);
  }
}
