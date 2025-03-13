import { Routes } from '@angular/router';

export const registerCampesinoRouter: Routes = [
    {
        path: 'registerCampesino',
        loadComponent: () => import('../layaut/register-campesino/register-campesino.component').then(m => m.RegisterCampesinoComponent)
    }
    
];

