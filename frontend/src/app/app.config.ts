import {ApplicationConfig, provideBrowserGlobalErrorListeners} from '@angular/core';
import {provideRouter, withComponentInputBinding} from '@angular/router';

import {routes} from './app.routes';
import {provideHttpClient, withInterceptors} from '@angular/common/http';
import {authInterceptorInterceptor} from './core/interceptors/auth-interceptor-interceptor';
import {loaderInterceptor} from './core/interceptors/loader.interceptor';
import {provideToastr} from 'ngx-toastr';
import {provideAnimations} from '@angular/platform-browser/animations';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(withInterceptors([authInterceptorInterceptor, loaderInterceptor])),
    provideToastr(),provideAnimations()
  ]
};
