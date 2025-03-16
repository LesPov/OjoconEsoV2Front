// campesinoRouter.ts
import { Routes } from '@angular/router';
import { RoleGuard } from '../../guard/role.guard';

export const campesinoRouter: Routes = [
  {
    path: 'campesino',
    canActivate: [RoleGuard],
    canActivateChild: [RoleGuard],
    data: { roles: ['campesino'] },
    loadComponent: () => import('../layout/body/body.component').then(m => m.BodyComponent),
    children: [
      {
        path: 'profile',
        loadComponent: () => import('../../profile/layout/view-profile/view-profile.component').then(m => m.ViewProfileComponent)
      },
      {
        path: 'dashboard',
        loadComponent: () => import('../layout/campesino-dashboard/campesino-dashboard.component').then(m => m.CampesinoDashboardComponent)
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
    ]
  }
];
