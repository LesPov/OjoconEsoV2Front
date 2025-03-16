// clientRouter.ts
import { Routes } from '@angular/router';
import { registerCampesinoRouter } from './registerCampesino';
import { RoleGuard } from '../../guard/role.guard';

export const clientRouter: Routes = [
  {
    path: 'client',
    canActivate: [RoleGuard],
    canActivateChild: [RoleGuard],
    data: { roles: ['client'] },
    loadComponent: () => import('../layout/body/body.component').then(m => m.BodyComponent),
    children: [
      ...registerCampesinoRouter,
      {
        path: 'profile',
        loadComponent: () => import('../../profile/layout/view-profile/view-profile.component').then(m => m.ViewProfileComponent)
      },
      {
        path: 'dashboard',
        loadComponent: () => import('../layout/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'zonas',
        children: [
          {
            path: '',
            loadComponent: () => import('../layout/three/zone/zone.component').then(m => m.ZoneComponent)
          },
          {
            path: 'scene/:zoneId',
            loadComponent: () => import('../layout/three/scene/scene.component').then(m => m.SceneComponent)
          }
        ]
      },
      {
        path: 'productos',
        loadComponent: () => import('../layout/three/market/market.component').then(m => m.MarketComponent)
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
    ]
  }
];
