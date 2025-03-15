import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { authenticationRoutes } from './components/auth/routes/auth.router';
import { clientRouter } from './components/client/routes/clientRoutes';
import { adminRouter } from './components/admin/services/adminRoutes';
import { campesinoRouter } from './components/campesino/routes/campesinoRouter';

export const routes: Routes = [
    ...authenticationRoutes,
    ...clientRouter,
    ...adminRouter,
    ...campesinoRouter,
    { path: 'loading', loadComponent: () => import('./components/loading/loading.component').then(m => m.LoadingComponent) },
    { path: '', redirectTo: '/loading', pathMatch: 'full' },
    { path: '**', redirectTo: '/loading' },
];
@NgModule({
    imports: [RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })],
    exports: [RouterModule]
})
export class AppRoutingModule { }
