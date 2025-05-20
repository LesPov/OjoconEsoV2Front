// src/app/modules/admin/middleware/interfaces/denunciasOficialInterface.ts

export interface MediaAttachment {
  type: 'image' | 'video';
  url: string;
}

// Interfaz para el objeto 'denunciante' que viene del backend
export interface DenuncianteInfo {
  tipoIdentificacion: string;
  numeroIdentificacion: string;
  nombre: string;
  apellido: string;
  fechaNacimiento?: string; // "YYYY-MM-DD"
  enNombreDeTercero: boolean;
}

// Interfaz para el objeto 'incidente' que viene del backend
export interface IncidenteInfo {
  zona: string;
  ciudad?: string;
  barrio?: string | null; // Puede ser null
  municipio?: string;
  vereda?: string;
  fecha: string; // "YYYY-MM-DD"
  hora: string;  // "HH:MM"
  viaPublica: boolean; // Ojo: en tu JSON es 'viaPublica', no 'ocurrioViaPublica'
}

export interface DenunciaOficialResponseInterface {
  id: number;
  descripcion: string;
  direccion: string; // Dirección principal de la denuncia, no del incidente necesariamente
  claveUnica: string;
  status: 'Pendiente' | 'En Proceso' | 'Cerrada'; // Ajusta según tus estados
  tieneEvidencia: boolean;
  pruebas?: MediaAttachment[]; // Asumiendo que el backend las envía ya procesadas como MediaAttachment
  audio?: string; // Asumiendo que el backend envía la URL completa
  // userId?: number; // Si el backend lo envía y lo necesitas

  // OBJETOS ANIDADOS TAL COMO VIENEN DEL BACKEND
  denunciante: DenuncianteInfo;
  incidente: IncidenteInfo;

  // TIPOS Y SUBTIPOS (con 't' y 's' minúsculas)
  tipoDenuncia: { id: number; nombre: string };
  subtipoDenuncia: { id: number; nombre: string };

  // FECHAS DE LA DENUNCIA (no del incidente)
  fechaCreacion: string; // "YYYY-MM-DDTHH:mm:ss.sssZ"
  fechaActualizacion: string; // "YYYY-MM-DDTHH:mm:ss.sssZ"

  usuarioRegistrador?: any; // O una interfaz más específica si lo usas
}

// Interfaz para la creación (esta parece estar bien, ya que mapea a los campos del backend)
export interface DenunciaOficialCreacionInterface {
  descripcion: string;
  direccion: string;
  nombreTipo: string;
  nombreSubtipo: string;
  tipoIdentificacionDenunciante: string;
  numeroIdentificacionDenunciante: string;
  nombreDenunciante: string;
  apellidoDenunciante: string;
  fechaNacimientoDenunciante?: string;
  denunciaEnNombreDeTercero: boolean;
  zonaIncidente: string;
  ciudadIncidente?: string;
  barrioIncidente?: string;
  municipioIncidente?: string;
  veredaIncidente?: string;
  fechaIncidente: string;
  horaIncidente: string;
  ocurrioViaPublica: boolean;
}