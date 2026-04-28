import {Routes} from '@angular/router';
import {TestComponent} from './test/test.component';
import {adminCanActivate, adminCanMatch} from './core/guards/admin.guard';

export const routes: Routes = [
  {
    path: "", redirectTo: "auth", pathMatch: "full",
  },

  { path: "auth", loadChildren: () => import('./auth/auth.routes').then(m => m.routes) },
  {
    path: "admins",
    loadChildren: () => import('./features/admin/admin.routes').then(m => m.routes),
    // canMatch: [adminCanMatch],
    // canActivate: [adminCanActivate]
  },
  { path: "test", component: TestComponent }




];
