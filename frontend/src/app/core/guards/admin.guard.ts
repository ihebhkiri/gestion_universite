import { inject } from '@angular/core';
import { Router, CanActivateFn, CanMatchFn } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

const verifyAdminAccess = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.getUserInfo().pipe(
    map(userInfo => {
      if (userInfo && userInfo.roles && userInfo.roles.some(role => role.toUpperCase().includes('ROLE_ADMIN'))) {
        return true;
      }
      return router.createUrlTree(['/auth']);
    }),
    catchError(() => {

      return of(router.createUrlTree(['/auth']));
    })
  );
};

export const adminCanActivate: CanActivateFn = () => verifyAdminAccess();
export const adminCanMatch: CanMatchFn = () => verifyAdminAccess();
