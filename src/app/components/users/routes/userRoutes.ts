import { Routes } from '@angular/router';

export const userRouter: Routes = [

    // {
    //     path: 'user',
    //     loadComponent: () => import('../../users/').then(m => m.BodyComponent),
    //     canActivate: [RoleGuard],
    //     data: { allowedRoles: ['user'] },
    //     children: [
    //         {
    //             path: 'profile',
    //             loadComponent: () => import('../../../auth/layout/profile/layout/view-profile/view-profile.component').then(m => m.ViewProfileComponent)
    //         },
    //         {
    //             path: 'dashboard',
    //             loadComponent: () => import('../../layout/dashboard/dashboard.component').then(m => m.DashboardComponent)
    //         },

    //         {
    //             path: '',
    //             redirectTo: 'dashboard',
    //             pathMatch: 'full'
    //         }
    //     ]
    // }
];