import { Routes } from '@angular/router';
import {TestComponent} from './test/test.component';

export const routes: Routes = [
  {
    path: "", redirectTo: "auth",pathMatch: "full",
  },

  {path: "auth", loadChildren: () => import('./auth/auth.routes').then(m => m.routes)},
  {path: "admin", loadChildren: () => import('./features/admin/admin.routes').then(m => m.routes)},
  {path: "test", component:TestComponent},




];
