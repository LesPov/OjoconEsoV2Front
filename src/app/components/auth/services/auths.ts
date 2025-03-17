import { HttpHeaders, HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { auth } from "../interfaces/auth";
import { environment } from "../../../../environments/environment";
import { Observable, tap } from "rxjs";
import { LoginResponse } from "../interfaces/loginResponse";

 @Injectable({
    providedIn: 'root',
})
export class authService {
    // Usamos baseUrl para todas las rutas
    private baseUrl: string = `${environment.endpoint}auth/user/`;
    private headers = new HttpHeaders().set('Content-Type', 'application/json');

    constructor(private http: HttpClient) { }  

    register(user: auth): Observable<void> {
        return this.http.post<void>(`${this.baseUrl}register`, user, { headers: this.headers });
    }

     verifyEmail(username: string, verificationCode: string): Observable<any> {
        return this.http.put<any>(`${this.baseUrl}verify/email`, { username, verificationCode }, { headers: this.headers });
    }

    resendVerificationEmail(username: string): Observable<void> {
        return this.http.post<void>(`${this.baseUrl}verify/email/resend`, { username }, { headers: this.headers });
    }

    // Método para registrar el número de teléfono
    registerPhoneNumber(username: string, phoneNumber: string): Observable<void> {
        return this.http.post<void>(`${this.baseUrl}phone/send`, { username, phoneNumber }, { headers: this.headers });
    }

    getCountries(): Observable<any[]> {
        return this.http.get<any[]>(`${this.baseUrl}countries`, { headers: this.headers });
    }

    resendVerificationPhone(username: string, phoneNumber: string): Observable<void> {
        return this.http.post<void>(`${this.baseUrl}phone/verify/resend`, { username, phoneNumber }, { headers: this.headers });
    }

    verifyPhoneNumber(username: string, phoneNumber: string, verificationCode: string): Observable<any> {
        return this.http.put<any>(`${this.baseUrl}phone/verify`, { username, phoneNumber, verificationCode }, { headers: this.headers });
    }

    login(user: auth): Observable<LoginResponse> {
        return this.http.post<LoginResponse>(`${this.baseUrl}login`, user, { headers: this.headers })
            .pipe(
                tap(response => {
                    if (response.token) {
                        localStorage.setItem('token', response.token);
                        if (response.userId) {
                            localStorage.setItem('userId', response.userId);
                        }
                    }
                })
            );
    }
}
