import { Routes } from '@angular/router';
import { RoleGuard } from '../../guard/autorization.guard';
import { registerCampesinoRouter } from './registerCampesinoRouter';

export const userRouter: Routes = [

    {
        path: 'user',
        loadComponent: () => import('../../users/layaut/body/body.component').then(m => m.BodyComponent),
        canActivate: [RoleGuard],
        data: { allowedRoles: ['user'] },
        children: [
            ...registerCampesinoRouter,

            {
                path: 'profile',
                loadComponent: () => import('../../auth/layout/profile/layout/view-profile/view-profile.component').then(m => m.ViewProfileComponent)
            },
            {
                path: 'dashboard',
                loadComponent: () => import('../../users/layaut/dashboard/dashboard.component').then(m => m.DashboardComponent)
            },

            {
                path: '',
                redirectTo: 'dashboard',
                pathMatch: 'full'
            }
        ]
    }
];