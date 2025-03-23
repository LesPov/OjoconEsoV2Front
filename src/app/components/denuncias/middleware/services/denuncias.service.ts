import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { TipoDenunciaInterface } from '../../../admin/middleware/interfaces/tipoDenunciaInterface';
import { SubtipoDenunciaInterface } from '../../../admin/middleware/interfaces/subtipoDenunciaInterface';
import { DenunciaAnonimaInterface } from '../../../admin/middleware/interfaces/denunciasAnonimasInterface';
import { ConsultaDenunciaResponse } from '../interfaces/consultainterfaces';

@Injectable({
  providedIn: 'root',
})
export class DenunciasService {
  private baseUrl: string = `${environment.endpoint}denuncias`;

  constructor(private http: HttpClient) {}

  /**
   * Crea un nuevo tipo de denuncia.
   */
  createTipoDenuncia(formData: FormData): Observable<TipoDenunciaInterface> {
    const token = localStorage.getItem('token') || '';
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });
    return this.http.post<TipoDenunciaInterface>(`${this.baseUrl}/agregar_tipos`, formData, { headers });
  }

  /**
   * Crea un nuevo subtipo de denuncia.
   */
  createSubtipoDenuncia(formData: FormData): Observable<SubtipoDenunciaInterface> {
    const token = localStorage.getItem('token') || '';
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });
    return this.http.post<SubtipoDenunciaInterface>(`${this.baseUrl}/agregar_subtipo`, formData, { headers });
  }

  /**
   * Obtiene la lista de tipos de denuncias anónimas o "ambas".
   */
  getTiposDenunciaAnonimas(): Observable<TipoDenunciaInterface[]> {
    const token = localStorage.getItem('token') || '';
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });
    return this.http.get<TipoDenunciaInterface[]>(`${this.baseUrl}/tipos`, { headers });
  }

  /**
   * Obtiene la lista de subtipos de denuncias.
   */
  getSubtiposDenuncia(): Observable<SubtipoDenunciaInterface[]> {
    const token = localStorage.getItem('token') || '';
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });
    return this.http.get<SubtipoDenunciaInterface[]>(`${this.baseUrl}/subtipos`, { headers });
  }
   // Crear una denuncia anónima con archivos de prueba y audio
   crearDenunciaAnonima(
    denuncia: DenunciaAnonimaInterface,
    pruebas: File[] = [],
    audios: File[] = []
  ): Observable<{ message: string; nuevaDenuncia: DenunciaAnonimaInterface }> {
    const formData = new FormData();

    // Agrega los campos de la denuncia al FormData
    formData.append('descripcion', denuncia.descripcion);
    formData.append('direccion', denuncia.direccion);
    formData.append('nombreTipo', denuncia.nombreTipo);
    formData.append('nombreSubtipo', denuncia.nombreSubtipo);

    // Agrega cada archivo de prueba
    pruebas.forEach((file, index) => {
      formData.append('pruebas', file, file.name);
    });

    // Agrega cada archivo de audio
    audios.forEach((file, index) => {
      formData.append('audio', file, file.name);
    });

    return this.http.post<{ message: string; nuevaDenuncia: DenunciaAnonimaInterface }>(
      `${this.baseUrl}/anonimas`,
      formData
    );
  }

  /**
   * Obtiene todas las denuncias anónimas (para admin).
   * Este método se conecta al controlador de consultas del admin.
   */
  getTodasDenunciasAnonimas(): Observable<{ message: string; denuncias: DenunciaAnonimaInterface[] }> {
    const token = localStorage.getItem('token') || '';
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });
    return this.http.get<{ message: string; denuncias: DenunciaAnonimaInterface[] }>(
      `${this.baseUrl}/admin/consultas`,
      { headers }
    );
  }
   // Nuevo servicio para consultar una denuncia anónima por clave única
   consultarDenunciaAnonima(claveUnica: string): Observable<ConsultaDenunciaResponse> {
    const token = localStorage.getItem('token') || '';
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });
    return this.http.get<ConsultaDenunciaResponse>(
      `${this.baseUrl}/consultas`,
      {
        headers,
        params: { claveUnica } // Se envía la clave como parámetro de consulta
      }
    );
  }
}
