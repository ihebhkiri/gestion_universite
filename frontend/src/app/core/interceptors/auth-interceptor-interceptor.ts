import {HttpInterceptorFn} from '@angular/common/http';
import {catchError} from 'rxjs/operators';
import {AuthService} from '../../auth/auth.service';
import {inject} from '@angular/core';
import {switchMap, throwError} from 'rxjs';

export const authInterceptorInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const cloned = req.clone({
    withCredentials: true
  });
  return next(cloned).pipe(
    catchError(error => {

      if (error.status === 403 &&
        !req.url.includes('/auth/refresh')) {
        console.log("Unauthorized, attempting to refresh token...");
        return authService.refresh().pipe(
          switchMap(() => {
            return next(cloned);
          })
        );
      }

      return throwError(() => error);
    })
  );
};
