import { Routes } from '@angular/router';

export const registerCampesinoRouter: Routes = [
    {
        path: 'registerCampesino',
        loadComponent: () => import('../layout/register-campesino/register-campesino.component').then(m => m.RegisterCampesinoComponent)
    },
    {
        path: 'ubicacion',
        loadComponent: () => import('../layout/register-campesino/ubicacion/ubicacion.component').then(m => m.UbicacionComponent)
    },
    {
        path: 'registerCampiamigo',
        loadComponent: () => import('../layout/register-campesino/update-minimal-profile/update-minimal-profile.component').then(m => m.UpdateMinimalProfileComponent)
    }
];

