// src/app/admin/services/adminService.ts
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Profile } from '../../auth/layout/profile/interfaces/profileInterfaces';

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
    private baseUrl: string = `${environment.endpoint}user/admin/`;

    constructor(private http: HttpClient) { }

    getAllUsers(): Observable<AdminUser[]> {
        const token = localStorage.getItem('token') || '';
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
        return this.http.get<AdminUser[]>(`${this.baseUrl}accounts`, { headers });
    }

    updateUser(userId: number, formData: FormData): Observable<AdminUser> {
        const token = localStorage.getItem('token') || '';
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
        return this.http.put<AdminUser>(`${this.baseUrl}account/${userId}`, formData, { headers });
    }

    getProfileByUserIdAdmin(userId: number): Observable<Profile> {
        const token = localStorage.getItem('token') || '';
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
        return this.http.get<Profile>(`${this.baseUrl}profiles/${userId}`, { headers });
    }

    // Actualiza el perfil del usuario en la ruta /admin/profile/:id
    updateProfile(userId: number, profileData: Profile): Observable<Profile> {
        const token = localStorage.getItem('token') || '';
        const headers = new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
        });
        return this.http.put<Profile>(`${this.baseUrl}profile/${userId}`, profileData, { headers });
    }
  
}
