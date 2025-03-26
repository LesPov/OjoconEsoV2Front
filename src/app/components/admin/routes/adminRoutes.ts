import { Routes } from '@angular/router';
import { RoleGuard } from '../../guard/autorization.guard';

export const adminRouter: Routes = [

    {
        path: 'admin',
        loadComponent: () => import('../layout/body/body.component').then(m => m.BodyComponent),
        canActivate: [RoleGuard],
        data: { allowedRoles: ['admin'] },
        children: [
            {
                path: 'profile',
                loadComponent: () => import('../../auth/layout/profile/layout/view-profile/view-profile.component').then(m => m.ViewProfileComponent)
            },
            {
                path: 'dashboard',
                loadComponent: () => import('../layout/admin-dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent)
            },
            {
                path: 'users',
                loadComponent: () => import('../layout/users/users.component').then(m => m.UsersComponent)
            },
          
            {
                path: 'user-summary/:id',
                loadComponent: () => import('../layout/users/user-summary/user-summary.component').then(m => m.UserSummaryComponent)
            },
            {
                path: '',
                redirectTo: 'dashboard',
                pathMatch: 'full'
            }
        ]
    }
];