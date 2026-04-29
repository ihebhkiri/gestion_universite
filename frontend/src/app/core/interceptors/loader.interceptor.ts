import {HttpInterceptorFn} from '@angular/common/http';
import {inject} from '@angular/core';
import {finalize} from 'rxjs';
import {LoaderService} from '../services/loader.service';
import {SKIP_GLOBAL_LOADER} from '../constant/loader-context';

export const loaderInterceptor: HttpInterceptorFn = (req, next) => {
  const loaderService = inject(LoaderService)

  if (req.context.get(SKIP_GLOBAL_LOADER)) {
    return next(req);
  }

  loaderService.show();

  return next(req).pipe(
    finalize(() => loaderService.hide())
  );
};
