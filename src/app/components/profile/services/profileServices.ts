import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Profile } from '../interfaces/profileInterfaces';

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  // Base URL para las rutas de perfil
  private baseUrl: string = `${environment.endpoint}user/profile/`;

  constructor(private http: HttpClient) {}

  // Consulta el perfil del usuario (GET /client/me)
  getProfile(): Observable<Profile> {
    const token = localStorage.getItem('token') || '';
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<Profile>(`${this.baseUrl}client/me`, { headers });
  }

  // Actualiza el perfil completo (PUT /client/update-profile)
  updateProfile(profileData: FormData): Observable<any> {
    const token = localStorage.getItem('token') || '';
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.put<any>(`${this.baseUrl}client/update-profile`, profileData, { headers });
  }

  // Actualiza el perfil mínimo (PUT /client/update-minimal-profile)
  // Enviamos un objeto JSON ya que no se requiere subir archivos
  updateMinimalProfile(data: {  
    identificationType: string;
    identificationNumber: string;
    direccion: string;
    campiamigo: boolean;
  }): Observable<any> {
    const token = localStorage.getItem('token') || '';
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
    return this.http.put<any>(`${this.baseUrl}client/update-minimal-profile`, data, { headers });
  }
}
