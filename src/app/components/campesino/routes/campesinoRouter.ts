import { Routes } from '@angular/router';
import { RoleGuard } from '../../guard/autorization.guard';

export const campesinoRouter: Routes = [
  {
    path: 'campesino',
    loadComponent: () => import('../layout/body/body.component').then(m => m.BodyComponent),
    canActivate: [RoleGuard],
    data: { allowedRoles: ['campesino'] },
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
