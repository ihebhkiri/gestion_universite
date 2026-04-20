import {Routes} from '@angular/router';

export const routes: Routes = [
  {
    path: "", redirectTo: "dashboard", pathMatch: "full",
  },

  {
    path: 'dashboard',
    loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'users',
    loadComponent: () => import('./user_managment/user/user.component').then(m => m.UserComponent)
  },
  {
    path: 'teaching',
    loadComponent: () => import('./teaching/pages/teaching-management/teaching-management.component').then(m => m.TeachingManagementComponent)
  }

]
