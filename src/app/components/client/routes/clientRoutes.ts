import { Routes } from '@angular/router';
import { registerCampesinoRouter } from './registerCampesino';

export const clientRouter: Routes = [
  {
    path: 'client',
    loadComponent: () => import('../layaut/body/body.component').then(m => m.BodyComponent),
    children: [
      ...registerCampesinoRouter,

      {
        path: 'dashboard',
        loadComponent: () => import('../layaut/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'zonas',
        children: [
          {
            path: '',
            loadComponent: () => import('../layaut/three/zone/zone.component').then(m => m.ZoneComponent)
          },
          {
            // Agrega el parámetro :zoneId
            path: 'scene/:zoneId',
            loadComponent: () => import('../layaut/three/scene/scene.component').then(m => m.SceneComponent)
          }
        ]
      },
      {
        path: 'productos',
        loadComponent: () => import('../layaut/three/market/market.component').then(m => m.MarketComponent)
      },
   
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
    ]
  }
];

