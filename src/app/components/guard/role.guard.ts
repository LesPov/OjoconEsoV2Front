// role.guard.ts
import { Injectable } from '@angular/core';
import {
  CanActivate,
  CanActivateChild,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router
} from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate, CanActivateChild {

  constructor(private router: Router) {}

  // Función recursiva para obtener los roles permitidos desde la ruta actual hasta la raíz
  private getAllowedRoles(route: ActivatedRouteSnapshot): Array<string> | null {
    if (route.data && route.data['roles']) {
      return route.data['roles'] as Array<string>;
    }
    return route.parent ? this.getAllowedRoles(route.parent) : null;
  }

  private checkRole(route: ActivatedRouteSnapshot): boolean {
    const allowedRoles = this.getAllowedRoles(route);
    const userRole = localStorage.getItem('rol');

    // Si se encuentran roles permitidos y el rol del usuario está incluido, se permite el acceso
    if (userRole && allowedRoles && allowedRoles.includes(userRole)) {
      return true;
    } else {
      this.router.navigate(['/unauthorized']);
      return false;
    }
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    return this.checkRole(route);
  }

  canActivateChild(childRoute: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    return this.checkRole(childRoute);
  }
}
