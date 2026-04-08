export const routes = [{
  path: "forgot-password",
  loadComponent: () => import('./pages/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent)
}, {
  path: "reset-password",
  loadComponent: () => import('./pages/reset-passwrod/reset-passwrod.component').then(m => m.ResetPasswrodComponent)
}, {path: "", loadComponent: () => import('../auth/pages/login/login.component').then(m => m.LoginComponent)}
]
