import { Routes } from '@angular/router';

export const clientRouter: Routes = [
  {
    path: 'client',
    loadComponent: () => import('../../client/layaut/body/body.component').then(m => m.BodyComponent),
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('../../client/layaut/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'zonas',
        children: [
          {
            path: '',
            loadComponent: () => import('../../client/layaut/three/zone/zone.component').then(m => m.ZoneComponent)
          },
          {
            // Agrega el parámetro :zoneId
            path: 'scene/:zoneId',
            loadComponent: () => import('../../client/layaut/three/scene/scene.component').then(m => m.SceneComponent)
          }
        ]
      },
      {
        path: 'productos',
        loadComponent: () => import('../../client/layaut/three/market/market.component').then(m => m.MarketComponent)
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
    ]
  }
];

 