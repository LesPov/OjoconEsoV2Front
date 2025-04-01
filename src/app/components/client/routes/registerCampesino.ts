import { Routes } from '@angular/router';

export const registerCampesinoRouter: Routes = [
    {
        path: 'registerCampesino',
        loadComponent: () => import('../layout/register-campesino/register-campesino.component').then(m => m.RegisterCampesinoComponent)
    }
    
];

