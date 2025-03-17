import { Injectable } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { filter } from 'rxjs/operators';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
import {jwtDecode} from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class UserStatusService {
  public status$ = new BehaviorSubject<string>('Desactivado');

  // Asegúrate de que estas rutas coincidan con las redirecciones reales:
  private allowedRoutes: { [role: string]: string[] } = {
    admin: ['/admin'],      // Ej: /admin/dashboard, /admin/profile, etc.
    client: ['/client'],    // Ahora se espera que los clientes naveguen a /client
    campesino: ['/campesino'] 
  };

  constructor(private router: Router, private http: HttpClient) {
    // Se suscribe a NavigationEnd para detectar cambios de ruta
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.updateStatus(event.urlAfterRedirects);
      });
  }

  updateStatus(currentUrl: string): void {
    const token = localStorage.getItem('token');
    let userRole = '';
    if (token) {
      try {
        const payload: any = jwtDecode(token);
        userRole = payload.rol;
      } catch (error) {
        console.error('Error al decodificar el token', error);
      }
    }

    let newStatus = 'Desactivado';
    if (
      userRole &&
      this.allowedRoutes[userRole] &&
      this.allowedRoutes[userRole].some(route => currentUrl.startsWith(route))
    ) {
      newStatus = 'Activado';
    }

    if (this.status$.value !== newStatus) {
      this.status$.next(newStatus);
      this.updateStatusInBackend(newStatus);
    }
  }

  updateStatusInBackend(newStatus: string): void {
    const token = localStorage.getItem('token') || '';
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
    this.http.put(`${environment.endpoint}auth/user/updateStatus`, { status: newStatus }, { headers })
      .subscribe({
        next: (res) => console.log('Estado de autenticación actualizado en BD', res),
        error: (err) => console.error('Error al actualizar el estado en BD', err)
      });
  }
}
