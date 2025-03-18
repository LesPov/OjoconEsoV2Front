import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Profile } from '../../profile/interfaces/profileInterfaces';

export interface AdminUser {
    id: number;
    username: string;
    phoneNumber?: string;
    email: string;
    rol: string;
    status: 'Activado' | 'Desactivado';
    userProfile: {
        profilePicture: string;
    };
}

@Injectable({
    providedIn: 'root',
})
export class AdminService {
    // Asegúrate de que el endpoint esté configurado correctamente
    private baseUrl: string = `${environment.endpoint}user/admin/`;

    constructor(private http: HttpClient) { }

    // Método para obtener todos los usuarios (con perfil)
    getAllUsers(): Observable<AdminUser[]> {
        const token = localStorage.getItem('token') || '';
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
        return this.http.get<AdminUser[]>(`${this.baseUrl}usersProfile`, { headers });
    }

    // Método para actualizar los datos del usuario mediante FormData
    updateUser(userId: number, formData: FormData): Observable<AdminUser> {
        const token = localStorage.getItem('token') || '';
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
        return this.http.put<AdminUser>(`${this.baseUrl}user/${userId}`, formData, { headers });
    }

    // Método para obtener el perfil de un usuario por ID
    getProfileByUserIdAdmin(userId: number): Observable<Profile> {
      const token = localStorage.getItem('token') || '';
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
      // Se espera que la ruta completa sea: /user/admin/profile/:id
      return this.http.get<Profile>(`${this.baseUrl}profile/${userId}`, { headers });
    }
}
