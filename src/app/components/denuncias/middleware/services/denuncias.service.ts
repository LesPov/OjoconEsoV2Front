import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { TipoDenunciaInterface } from '../../../admin/middleware/interfaces/tipoDenunciaInterface';
import { SubtipoDenunciaInterface } from '../../../admin/middleware/interfaces/subtipoDenunciaInterface';
import { DenunciaAnonimaInterface } from '../../../admin/middleware/interfaces/denunciasAnonimasInterface';
import { ConsultaDenunciaResponse } from '../interfaces/consultainterfaces';
import { DenunciaOficialCreacionInterface, DenunciaOficialResponseInterface } from '../../../admin/middleware/interfaces/denunciasOficialInterface';

@Injectable({
  providedIn: 'root',
})
export class DenunciasService {
  private baseUrl: string = `${environment.endpoint}denuncias`;

  constructor(private http: HttpClient) { }

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
   * Obtiene la lista de tipos de denuncias anónimas o "ambas" y oficiales .
   */
  // denuncias.service.ts
  // denuncias.service.ts
  getTiposDenuncia(
    tipo: 'anonima' | 'oficial' = 'anonima'
  ): Observable<TipoDenunciaInterface[]> {
    const token = localStorage.getItem('token') || '';
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });
    return this.http.get<{ tipo: string; tipos: TipoDenunciaInterface[] }>(
      `${this.baseUrl}/tipos`,
      { headers, params: { tipo } }
    )
      .pipe(map(res => res.tipos));
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

  // --- MÉTODO crearDenunciaOficial COMPLETAMENTE ACTUALIZADO ---
  crearDenunciaOficial(
    denuncia: DenunciaOficialCreacionInterface, // Usa la interfaz de CREACIÓN que ya definiste
    pruebas: File[] = [],
    audios: File[] = []
    // El tipo de retorno del Observable debe reflejar la respuesta del backend,
    // que incluye la denuncia creada con todos sus campos (DenunciaOficialResponseInterface).
  ): Observable<{ message: string; nuevaDenuncia: DenunciaOficialResponseInterface }> {
    const formData = new FormData();

    // --- Campos básicos que ya tenías ---
    formData.append('descripcion', denuncia.descripcion);
    formData.append('direccion', denuncia.direccion);
    formData.append('nombreTipo', denuncia.nombreTipo);
    formData.append('nombreSubtipo', denuncia.nombreSubtipo);

    // --- NUEVOS CAMPOS DEL DENUNCIANTE ---
    formData.append('tipoIdentificacionDenunciante', denuncia.tipoIdentificacionDenunciante);
    formData.append('numeroIdentificacionDenunciante', denuncia.numeroIdentificacionDenunciante);
    formData.append('nombreDenunciante', denuncia.nombreDenunciante);
    formData.append('apellidoDenunciante', denuncia.apellidoDenunciante);
    if (denuncia.fechaNacimientoDenunciante) { // Solo añadir si el frontend lo proporciona
      formData.append('fechaNacimientoDenunciante', denuncia.fechaNacimientoDenunciante);
    }
    // Los booleanos se envían como string a FormData. El backend los parseará.
    formData.append('denunciaEnNombreDeTercero', String(denuncia.denunciaEnNombreDeTercero));

    // --- NUEVOS CAMPOS DEL INCIDENTE ---
    formData.append('zonaIncidente', denuncia.zonaIncidente);
    if (denuncia.ciudadIncidente) { // Si es opcional, solo añadir si existe
      formData.append('ciudadIncidente', denuncia.ciudadIncidente);
    }
    if (denuncia.barrioIncidente) { // Si es opcional, solo añadir si existe
      formData.append('barrioIncidente', denuncia.barrioIncidente);
    }
    if (denuncia.municipioIncidente) { // Si es opcional, solo añadir si existe
      formData.append('municipioIncidente', denuncia.municipioIncidente);
    }
    if (denuncia.veredaIncidente) { // Si es opcional, solo añadir si existe
      formData.append('veredaIncidente', denuncia.veredaIncidente);
    }
    formData.append('fechaIncidente', denuncia.fechaIncidente); // Formato YYYY-MM-DD
    formData.append('horaIncidente', denuncia.horaIncidente);   // Formato HH:MM
    formData.append('ocurrioViaPublica', String(denuncia.ocurrioViaPublica));

    // --- Archivos de evidencia (pruebas y audio) ---
    pruebas.forEach((file) => {
      formData.append('pruebas', file, file.name); // El backend espera 'pruebas'
    });
    audios.forEach((file) => {
      formData.append('audio', file, file.name);   // El backend espera 'audio'
    });

    // --- Token y Cabeceras (si no usas un interceptor global para el token) ---
    const token = localStorage.getItem('token') || '';
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    // No es necesario establecer 'Content-Type' para FormData; el navegador lo hace.

    return this.http.post<{ message: string; nuevaDenuncia: DenunciaOficialResponseInterface }>(
      `${this.baseUrl}/oficiales`, // Endpoint para denuncias oficiales
      formData,
      { headers }
    );
  }
  // --- Fin de MÉTODO crearDenunciaOficial ---

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
  consultarDenunciaOficial(
    claveUnica: string
  ): Observable<{
    success: boolean;
    message: string;
    denuncia: DenunciaOficialResponseInterface;
  }> {
    const token = localStorage.getItem('token') || ''; // Si no hay token, es string vacío
    // Si token es '', el header será 'Authorization: Bearer '
    // Esto es manejado por tu backend (extractBearerToken devuelve null, y se establece req.user = null)
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    const params = new HttpParams().set('claveUnica', claveUnica);

    return this.http.get<{
      success: boolean;
      message: string;
      denuncia: DenunciaOficialResponseInterface;
    }>(`${this.baseUrl}/oficiales/consultas`, {
      headers,
      params,
    });
  }
}
