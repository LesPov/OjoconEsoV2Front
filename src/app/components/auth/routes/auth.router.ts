import { Routes } from '@angular/router';

export const authenticationRoutes: Routes = [
    { path: 'auth/login', loadComponent: () => import('../layout/login/login.component').then(m => m.LoginComponent) },
    { path: 'auth/passwordrecovery', loadComponent: () => import('../layout/login/password-recovery/password-recovery.component').then(m => m.PasswordRecoveryComponent) },
    { path: 'auth/resetPassword', loadComponent: () => import('../layout/login/reset-password-recovery/reset-password-recovery.component').then(m => m.ResetPasswordRecoveryComponent) },
    { path: 'auth/register', loadComponent: () => import('../layout/register/register.component').then(m => m.RegisterComponent) },
    { path: 'auth/email', loadComponent: () => import('../layout/email/email.component').then(m => m.EmailComponent) },
    { path: 'auth/number', loadComponent: () => import('../layout/number/number.component').then(m => m.NumberComponent) },
    { path: 'auth/verifynumber', loadComponent: () => import('../layout/verify-number/verify-number.component').then(m => m.VerifyNumberComponent) },
    // Ruta por defecto para redirigir a login
    { path: '', redirectTo: 'auth/login', pathMatch: 'full' },
];
