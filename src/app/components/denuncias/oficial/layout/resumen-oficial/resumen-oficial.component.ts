import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common'; // Necesario para *ngIf, *ngFor, etc.
import { ToastrService } from 'ngx-toastr';

import { DenunciaOficialStorageService } from '../../../middleware/services/denuncia-oficial-storage.service';
import { DenunciasService as DenunciasHttpService } from '../../../middleware/services/denuncias.service';
import { DenunciaOficialCreacionInterface, DenunciaOficialResponseInterface } from '../../../../admin/middleware/interfaces/denunciasOficialInterface';
import { BotInfoService } from '../../../../admin/layout/utils/botInfoCliente';
import { NavbarComponent } from '../../../anonimas/layout/navbar/navbar.component'; // O un navbar específico

// Interfaz para previsualización, similar a la de ResumenComponent
interface MultimediaPreviewOficial {
  file: File;
  url: string;
  type: 'image' | 'video' | 'audio' | 'other';
}

@Component({
  selector: 'app-resumen-oficial',
  standalone: true,
  imports: [CommonModule, NavbarComponent], // Añade CommonModule
  templateUrl: './resumen-oficial.component.html',
  styleUrls: ['./resumen-oficial.component.css'] // Puedes crear este archivo o reutilizar estilos
})
export class ResumenOficialComponent implements OnInit, OnDestroy {
  modo: 'oficial' = 'oficial'; // Este componente es solo para el flujo oficial
  queryParams: any = {};

  datosResumen: Partial<DenunciaOficialCreacionInterface> = {}; // Para todos los datos de la denuncia
  
  // Archivos de evidencia
  pruebasFiles: File[] = [];
  audioFiles: File[] = [];
  
  // Para previsualización
  previewEvidencia: MultimediaPreviewOficial[] = [];
  selectedMediaItem: MultimediaPreviewOficial | null = null; // Para el modal de zoom

  claveUnica: string | null = null;
  showModal: boolean = false;
  isLoading: boolean = false;

  currentStep = 5; // Ajusta según el total de pasos de tu flujo oficial
  totalSteps = 5;  // Ajusta según el total de pasos

  private infoResumenOficial: string[] = [
    "Has llegado al resumen de tu denuncia oficial.",
    "Por favor, revisa cuidadosamente toda la información antes de enviarla.",
    "Si necesitas corregir algo, utiliza el botón 'Anterior' para retroceder a los pasos previos.",
    "Una vez enviada, guarda la clave única que se te proporcionará. La necesitarás para consultas futuras."
  ];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private denunciaOficialStorage: DenunciaOficialStorageService,
    private denunciasHttpService: DenunciasHttpService,
    private toastr: ToastrService,
    private botInfoService: BotInfoService
  ) {}

  ngOnInit(): void {
    this.route.queryParamMap.subscribe(params => {
      const tipoRuta = params.get('tipo');
      if (tipoRuta !== 'oficial') {
        this.toastr.error("Flujo incorrecto para el resumen de denuncia oficial.", "Error de Ruta");
        this.router.navigate(['/body/oficial']); // Redirigir al inicio del flujo oficial
        return;
      }
      const queryParamsTemp: any = {};
      params.keys.forEach(key => {
        queryParamsTemp[key] = params.get(key);
      });
      this.queryParams = queryParamsTemp;
      console.log('RESUMEN OFICIAL - Modo:', this.modo, 'Params:', this.queryParams);
    });

    // Cargar TODOS los datos acumulados de la denuncia oficial
    this.datosResumen = this.denunciaOficialStorage.getDenunciaData();
    this.pruebasFiles = this.denunciaOficialStorage.getPruebasFiles();
    this.audioFiles = this.denunciaOficialStorage.getAudioFiles();

    this.generatePreviews();

    // Validar si hay datos mínimos para mostrar el resumen
    // (puedes hacer esta validación más robusta según los campos obligatorios de cada paso)
    if (!this.datosResumen.nombreTipo || !this.datosResumen.descripcion || !this.datosResumen.direccion || !this.datosResumen.nombreDenunciante) {
      this.toastr.warning('Parece que faltan datos de pasos anteriores.', 'Información Incompleta');
      this.router.navigate(['/body/oficial']); // Redirigir al inicio si faltan datos cruciales
      return;
    }

    this.botInfoService.setInfoList(this.infoResumenOficial);
  }

  private generatePreviews(): void {
    this.previewEvidencia = [];
    this.pruebasFiles.forEach(file => {
      let type: MultimediaPreviewOficial['type'] = 'other';
      if (this.isImage(file)) type = 'image';
      else if (this.isVideo(file)) type = 'video';
      this.previewEvidencia.push({ file, url: URL.createObjectURL(file), type });
    });
    this.audioFiles.forEach(file => {
      this.previewEvidencia.push({ file, url: URL.createObjectURL(file), type: 'audio' });
    });
  }

  isImage(file: File): boolean { return file.type.startsWith('image/'); }
  isVideo(file: File): boolean { return file.type.startsWith('video/'); }
  isAudio(file: File): boolean { return file.type.startsWith('audio/'); }

  // Habilitar botón de envío si los datos mínimos están completos
  isEnviarButtonEnabled(): boolean {
    // Añade aquí las validaciones mínimas que consideres antes de permitir el envío
    return !!(
      this.datosResumen.descripcion &&
      this.datosResumen.direccion &&
      this.datosResumen.nombreTipo &&
      this.datosResumen.nombreSubtipo &&
      this.datosResumen.tipoIdentificacionDenunciante &&
      this.datosResumen.numeroIdentificacionDenunciante &&
      this.datosResumen.nombreDenunciante &&
      this.datosResumen.apellidoDenunciante &&
      this.datosResumen.zonaIncidente &&
      this.datosResumen.fechaIncidente &&
      this.datosResumen.horaIncidente &&
      typeof this.datosResumen.denunciaEnNombreDeTercero === 'boolean' &&
      typeof this.datosResumen.ocurrioViaPublica === 'boolean'
    );
  }

  enviarDenunciaOficial(): void {
    if (!this.isEnviarButtonEnabled()) {
      this.toastr.error('Faltan datos importantes en la denuncia. Por favor, revisa los pasos anteriores.', 'Datos Incompletos');
      return;
    }
    this.isLoading = true;

    // El objeto this.datosResumen ya debería tener todos los campos de DenunciaOficialCreacionInterface
    // gracias a los setters del DenunciaOficialStorageService.
    // Solo necesitamos asegurar que los campos requeridos no sean undefined.
    const denunciaParaEnviar: DenunciaOficialCreacionInterface = {
        descripcion: this.datosResumen.descripcion!,
        direccion: this.datosResumen.direccion!,
        nombreTipo: this.datosResumen.nombreTipo!,
        nombreSubtipo: this.datosResumen.nombreSubtipo!,
        tipoIdentificacionDenunciante: this.datosResumen.tipoIdentificacionDenunciante!,
        numeroIdentificacionDenunciante: this.datosResumen.numeroIdentificacionDenunciante!,
        nombreDenunciante: this.datosResumen.nombreDenunciante!,
        apellidoDenunciante: this.datosResumen.apellidoDenunciante!,
        fechaNacimientoDenunciante: this.datosResumen.fechaNacimientoDenunciante, // Puede ser undefined si es opcional
        denunciaEnNombreDeTercero: this.datosResumen.denunciaEnNombreDeTercero!,
        zonaIncidente: this.datosResumen.zonaIncidente!,
        ciudadIncidente: this.datosResumen.ciudadIncidente,
        barrioIncidente: this.datosResumen.barrioIncidente,
        municipioIncidente: this.datosResumen.municipioIncidente,
        veredaIncidente: this.datosResumen.veredaIncidente,
        fechaIncidente: this.datosResumen.fechaIncidente!,
        horaIncidente: this.datosResumen.horaIncidente!,
        ocurrioViaPublica: this.datosResumen.ocurrioViaPublica!,
    };


    this.denunciasHttpService.crearDenunciaOficial(denunciaParaEnviar, this.pruebasFiles, this.audioFiles)
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          this.claveUnica = response.nuevaDenuncia.claveUnica;
          this.showModal = true;
          this.toastr.success('Denuncia oficial enviada con éxito.', 'Denuncia Registrada');
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Error al crear la denuncia oficial:', error);
          let errorMessage = 'No se pudo enviar la denuncia.';
          if (error.error?.message) { errorMessage = error.error.message; }
          else if (error.error?.errors?.length > 0) { errorMessage = error.error.errors.join(' '); }
          this.toastr.error(errorMessage, 'Error de Envío');
        }
      });
  }

  // Métodos para el modal
  copiarClave(): void {
    if (this.claveUnica) {
      navigator.clipboard.writeText(this.claveUnica)
        .then(() => this.toastr.success("Clave copiada.", "Éxito"))
        .catch(err => this.toastr.error("Error al copiar.", "Error"));
    }
  }

  finalizarYRedirigir(): void {
    this.showModal = false;
    this.denunciaOficialStorage.resetDenunciaOficial(); // Limpiar storage OFICIAL
    this.router.navigate(['/body/oficial']); // O a una página de "gracias/éxito"
  }

  // Para modal de previsualización
  openMediaPreview(item: MultimediaPreviewOficial): void {
    this.selectedMediaItem = item;
  }

  closeMediaPreview(): void {
    this.selectedMediaItem = null;
  }

  goBack(): void {
    // Navegar al paso anterior (RegistroResidenciaIncidenteComponent)
    this.router.navigate(['/body/registroResidenciaIncidente'], { queryParams: this.queryParams, queryParamsHandling: 'merge' });
  }

  ngOnDestroy(): void {
    this.previewEvidencia.forEach(item => URL.revokeObjectURL(item.url));
  }
}