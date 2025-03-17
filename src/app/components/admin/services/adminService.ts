import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface AdminUser {
    id: number;
    username: string;
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
    // URL base para todas las rutas de admin
    private baseUrl: string = `${environment.endpoint}user/admin/`;

    constructor(private http: HttpClient) { }

    // Método para obtener todos los usuarios (perfil con imagen)
    getAllUsers(): Observable<AdminUser[]> {
        const token = localStorage.getItem('token') || '';
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
        return this.http.get<AdminUser[]>(`${this.baseUrl}usersProfile`, { headers });
    }


}
