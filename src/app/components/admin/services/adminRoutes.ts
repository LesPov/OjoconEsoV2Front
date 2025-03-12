import { Routes } from '@angular/router';

export const adminRouter: Routes = [
    // { path: 'login/passwordrecovery', loadComponent: () => import('../layout/login/passwordrecovery/passwordrecovery.component').then(m => m.PasswordrecoveryComponent) },
    { path: 'admin/dashboard', loadComponent: () => import('../../admin/layout/admin-dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent) },

];