import { Routes } from '@angular/router';

export const campesinoRouter: Routes = [
    // { path: 'login/passwordrecovery', loadComponent: () => import('../layout/login/passwordrecovery/passwordrecovery.component').then(m => m.PasswordrecoveryComponent) },
    { path: 'campesino/dashboard', loadComponent: () => import('../layout/campesino-dashboard/campesino-dashboard.component').then(m => m.CampesinoDashboardComponent) },

];