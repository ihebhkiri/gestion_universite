import { HttpInterceptorFn } from '@angular/common/http';

export const refreshInterceptorInterceptor: HttpInterceptorFn = (req, next) => {

  return next(req);
};
