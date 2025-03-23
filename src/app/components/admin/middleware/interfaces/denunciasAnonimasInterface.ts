export interface DenunciaAnonimaInterface {
  id: number;
  descripcion: string;
  direccion: string;
  nombreTipo: string;
  nombreSubtipo: string;
  pruebas?: string;
  audio?: string;
  claveUnica: string;
  tieneEvidencia?: boolean;
  status: 'Pendiente' | 'En Proceso' | 'Cerrada';
  fechaCreacion: Date;
  fechaActualizacion: Date;
  // Usa nombres en minúsculas según la respuesta:
  tipoDenuncia?: { id: number; nombre: string };
  subtipoDenuncia?: { id: number; nombre: string };
}
