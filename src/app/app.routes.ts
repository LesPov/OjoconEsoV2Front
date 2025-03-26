import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { authenticationRoutes } from './components/auth/routes/auth.router';
import { adminRouter } from './components/admin/routes/adminRoutes';
import { userRouter } from './components/users/routes/userRoutes';

export const routes: Routes = [
    ...authenticationRoutes,
    ...adminRouter,
    ...userRouter,

    { path: 'loading', loadComponent: () => import('./components/shared/loading/loading.component').then(m => m.LoadingComponent) },
    { path: 'inicio', loadComponent: () => import('./components/shared/inicio/inicio.component').then(m => m.InicioComponent) },
    { path: '', redirectTo: '/loading', pathMatch: 'full' },
    { path: '**', redirectTo: '/loading' },
];
@NgModule({
    imports: [RouterModule.forRoot(routes, {
        preloadingStrategy: PreloadAllModules,
        anchorScrolling: 'enabled',            // Habilita el anclaje
        scrollPositionRestoration: 'enabled'     // Opcional: restaura la posición al navegar
    })],
    exports: [RouterModule]
})
export class AppRoutingModule { }
