import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { authenticationRoutes } from './components/auth/routes/auth.router';
import { clientRouter } from './components/client/services/clientRoutes';
import { adminRouter } from './components/admin/services/adminRoutes';
import { campesinoRouter } from './components/campesino/services/campesinoRouter';

export const routes: Routes = [
    ...authenticationRoutes,
    ...clientRouter,
    ...adminRouter,
    ...campesinoRouter,
    { path: 'bienvenida', loadComponent: () => import('../app/components/bienvenido/bienvenido.component').then(m => m.BiembenidoComponent) },
    { path: '', redirectTo: '/bienvenida', pathMatch: 'full' },
    { path: '**', redirectTo: '/bienvenida' },
];
@NgModule({
    imports: [RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })],
    exports: [RouterModule]
})
export class AppRoutingModule { }
