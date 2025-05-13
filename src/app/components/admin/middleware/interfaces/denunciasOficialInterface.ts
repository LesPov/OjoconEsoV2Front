// En tu archivo de interfaces del frontend, por ejemplo:
// src/app/modules/admin/middleware/interfaces/denunciasOficialInterface.ts

// (Si tienes ENUMs definidos en el frontend para tipos de identificación o zona, impórtalos o defínelos)
// export enum TipoIdentificacionEnumFrontend { /* ... */ }
// export enum ZonaIncidenteEnumFrontend { /* ... */ }

export interface DenunciaOficialCreacionInterface {
  // --- Campos que ya tenías y son correctos para la creación ---
  descripcion: string;
  direccion: string;     // Dirección del incidente
  nombreTipo: string;    // Nombre del tipo de denuncia (el backend busca el ID)
  nombreSubtipo: string; // Nombre del subtipo de denuncia (el backend busca el ID)

  // --- NUEVOS CAMPOS DEL DENUNCIANTE (quien realiza la denuncia) ---
  tipoIdentificacionDenunciante: string; // O TipoIdentificacionEnumFrontend si lo usas
  numeroIdentificacionDenunciante: string;
  nombreDenunciante: string;
  apellidoDenunciante: string;
  fechaNacimientoDenunciante?: string; // Formato "YYYY-MM-DD". Opcional si en el backend es allowNull:true
  denunciaEnNombreDeTercero: boolean; // "¿Realiza esta denuncia en nombre de otra persona?"

  // --- NUEVOS CAMPOS DEL INCIDENTE ---
  zonaIncidente: string; // O ZonaIncidenteEnumFrontend si lo usas
  ciudadIncidente?: string; // Opcional si el backend lo permite o si municipioIncidente está presente
  barrioIncidente?: string; // Opcional, relevante si zonaIncidente es 'Urbana'
  municipioIncidente?: string; // Opcional si el backend lo permite o si ciudadIncidente está presente
  veredaIncidente?: string; // Opcional, relevante si zonaIncidente es 'Rural'
  fechaIncidente: string; // Formato "YYYY-MM-DD"
  horaIncidente: string;  // Formato "HH:MM"
  ocurrioViaPublica: boolean;

  // Los campos como id, claveUnica, status, pruebas, audio, tieneEvidencia, userId,
  // fechaCreacion, fechaActualizacion, tipoDenuncia, subtipoDenuncia
  // NO se envían desde el frontend al crear la denuncia.
  // Son generados/manejados por el backend o son parte de la respuesta.
}

// La DenunciaOficialResponseInterface (para la respuesta del backend) también debe estar actualizada
// para reflejar todos los campos que el backend devuelve.
export interface DenunciaOficialResponseInterface {
  id: number;
  descripcion: string;

  direccion: string;
  nombreTipo: string;
  nombreSubtipo: string;
  claveUnica: string;
  status: 'Pendiente' | 'En Proceso' | 'Cerrada';
  tieneEvidencia: boolean;
  pruebas?: string;
  audio?: string;
  userId: number;

  tipoIdentificacionDenunciante: string; // o el tipo del ENUM
  numeroIdentificacionDenunciante: string;
  nombreDenunciante: string;
  apellidoDenunciante: string;
  fechaNacimientoDenunciante?: string; // o Date
  denunciaEnNombreDeTercero: boolean;

  zonaIncidente: string; // o el tipo del ENUM
  ciudadIncidente?: string;
  barrioIncidente?: string;
  municipioIncidente?: string;
  veredaIncidente?: string;
  fechaIncidente: string; // o Date
  horaIncidente: string;
  ocurrioViaPublica: boolean;

  createdAt: string; // o Date
  updatedAt: string; // o Date

  TipoDenuncia?: { id: number; nombre: string };
  SubtipoDenuncia?: { id: number; nombre: string };
  // UsuarioRegistrador?: { id: number; username: string; /* ... */ };
}