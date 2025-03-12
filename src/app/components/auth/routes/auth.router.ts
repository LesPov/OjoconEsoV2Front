import { Routes } from '@angular/router';

export const authenticationRoutes: Routes = [
    // { path: 'login/passwordrecovery', loadComponent: () => import('../layout/login/passwordrecovery/passwordrecovery.component').then(m => m.PasswordrecoveryComponent) },
    { path: 'auth/login', loadComponent: () => import('../layout/login/login.component').then(m => m.LoginComponent) },
    { path: 'auth/register', loadComponent: () => import('../layout/register/register.component').then(m => m.RegisterComponent) },
    { path: 'auth/email', loadComponent: () => import('../layout/email/email.component').then(m => m.EmailComponent) },
    { path: 'auth/number', loadComponent: () => import('../layout/number/number.component').then(m => m.NumberComponent) },
    { path: 'auth/verifynumber', loadComponent: () => import('../layout/verify-number/verify-number.component').then(m => m.VerifyNumberComponent) },

];