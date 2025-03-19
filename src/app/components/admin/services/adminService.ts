// src/app/admin/services/adminService.ts
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Profile } from '../../profile/interfaces/profileInterfaces';
import { SocioDemographicData } from '../middleware/interfaces/socioDemographic.interface';

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
        return this.http.get<AdminUser[]>(`${this.baseUrl}usersProfile`, { headers });
    }

    updateUser(userId: number, formData: FormData): Observable<AdminUser> {
        const token = localStorage.getItem('token') || '';
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
        return this.http.put<AdminUser>(`${this.baseUrl}user/${userId}`, formData, { headers });
    }

    getProfileByUserIdAdmin(userId: number): Observable<Profile> {
        const token = localStorage.getItem('token') || '';
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
        return this.http.get<Profile>(`${this.baseUrl}profile/${userId}`, { headers });
    }

    getSociodemographicData(userId: number): Observable<SocioDemographicData> {
        const token = localStorage.getItem('token') || '';
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
        return this.http.get<SocioDemographicData>(`${this.baseUrl}sociodemographic/${userId}`, { headers });
    }

    // NUEVO: Método para actualizar la información sociodemográfica
    // Método alternativo para enviar datos en formato JSON
    updateSociodemographicData(userId: number, socioData: SocioDemographicData): Observable<SocioDemographicData> {
        const token = localStorage.getItem('token') || '';
        const headers = new HttpHeaders({
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        });
        return this.http.put<SocioDemographicData>(`${this.baseUrl}sociodemographic/${userId}`, socioData, { headers });
    }

}
