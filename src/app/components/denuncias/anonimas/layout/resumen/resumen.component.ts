import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { BotInfoService } from '../../../../admin/layout/utils/botInfoCliente';
import { DenunciaAnonimaInterface } from '../../../../admin/middleware/interfaces/denunciasAnonimasInterface';
import { DenunciasService } from '../../../middleware/services/denuncias.service';
import { DenunciaStorageService } from '../../../middleware/services/denunciaStorage.service';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../navbar/navbar.component';

interface MultimediaPreview {
  file: File;
  url: string;
}

@Component({
  selector: 'app-resumen',
  imports: [CommonModule, NavbarComponent],
  templateUrl: './resumen.component.html',
  styleUrls: ['./resumen.component.css']
})
export class ResumenComponent implements OnInit {
  currentStep = 3;
  totalSteps = 3;
  datosResumen: Partial<DenunciaAnonimaInterface> = {};
  claveUnica: string | null = null;
  showModal: boolean = false;

  // Archivos obtenidos del almacenamiento
  pruebas: File[] = [];
  audios: File[] = [];

  // Arreglos para guardar las URL de vista previa
  previewPruebas: MultimediaPreview[] = [];
  previewAudios: MultimediaPreview[] = [];

  // Propiedad para la imagen seleccionada en el modal de zoom
  selectedImage: MultimediaPreview | null = null;

  private inforesumen: string[] = [
    "Estás en la sección de resumen de tu denuncia.",
    "Revisa cuidadosamente la información antes de proceder.",
    "Si es necesario, puedes volver atrás para corregir la información.",
    "Guarda la clave de radicado una vez que envíes la denuncia, será necesaria para futuras consultas."
  ];

  constructor(
    private denunciaStorageService: DenunciaStorageService,
    private botInfoService: BotInfoService,
    private denunciasService: DenunciasService,
    private router: Router,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    // Obtener los datos de la denuncia del servicio de almacenamiento
    this.datosResumen = this.denunciaStorageService.getDenuncia();
    this.pruebas = this.denunciaStorageService.getPruebasFiles();
    this.audios = this.denunciaStorageService.getAudioFiles();

    // Generar las URL de vista previa para cada archivo multimedia (imágenes y videos)
    this.previewPruebas = this.pruebas.map(file => ({
      file,
      url: URL.createObjectURL(file)
    }));

    // Generar las URL de vista previa para cada audio
    this.previewAudios = this.audios.map(file => ({
      file,
      url: URL.createObjectURL(file)
    }));

    // Si falta información esencial, redirigir al componente de tipos
    if (
      !this.datosResumen.nombreTipo ||
      !this.datosResumen.nombreSubtipo ||
      !this.datosResumen.descripcion ||
      !this.datosResumen.direccion
    ) {
      this.router.navigate(['/tipos']);
    }
    this.botInfoService.setInfoList(this.inforesumen);
  }

  // Determina si un archivo es imagen
  isImage(file: File): boolean {
    return file.type.startsWith('image/');
  }

  // Botón "Continuar" habilitado si hay información básica
  isContinueButtonEnabled(): boolean {
    return !!(
      this.datosResumen.nombreTipo &&
      this.datosResumen.nombreSubtipo &&
      this.datosResumen.descripcion &&
      this.datosResumen.direccion
    );
  }

  // Maneja el envío de la denuncia
  handleContinue(): void {
    if (this.isContinueButtonEnabled()) {
      this.denunciasService
        .crearDenunciaAnonima(
          this.datosResumen as DenunciaAnonimaInterface,
          this.pruebas,
          this.audios
        )
        .subscribe({
          next: (response) => {
            this.claveUnica = response.nuevaDenuncia.claveUnica;
            this.showModal = true;
          },
          error: (error) => {
            console.error('Error al crear la denuncia:', error);
            this.toastr.error('Error al crear la denuncia', 'Error');
          },
        });
    }
  }

  copiarClave(): void {
    if (this.claveUnica) {
      navigator.clipboard.writeText(this.claveUnica)
        .then(() => this.toastr.success("Clave copiada al portapapeles", "Éxito"))
        .catch(err => console.error("Error al copiar la clave", err));
    }
  }

  closeModal(): void {
    this.showModal = false;
    this.denunciaStorageService.resetDenuncia();
    this.router.navigate(['/exito']);
  }

  // Métodos para abrir y cerrar el modal de vista previa de imagen
  openImagePreview(item: MultimediaPreview): void {
    this.selectedImage = item;
  }

  closeImagePreview(): void {
    this.selectedImage = null;
  }
}
