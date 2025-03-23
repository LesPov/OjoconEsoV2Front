import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { environment } from '../../../../../../environments/environment';
import { BotInfoService } from '../../../../admin/layout/utils/botInfoCliente';
import { SubtipoDenunciaInterface } from '../../../../admin/middleware/interfaces/subtipoDenunciaInterface';
import { TipoDenunciaInterface } from '../../../../admin/middleware/interfaces/tipoDenunciaInterface';
import { DenunciasService } from '../../../middleware/services/denuncias.service';
import { DenunciaStorageService } from '../../../middleware/services/denunciaStorage.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../navbar/navbar.component';

@Component({
  selector: 'app-subtipos-de-denuncias',
  imports: [FormsModule, CommonModule,NavbarComponent],
  templateUrl: './subtipos-de-denuncias.component.html',
  styleUrls: ['./subtipos-de-denuncias.component.css']
})
export class SubtiposDeDenunciasComponent implements OnInit {
  subtipos: SubtipoDenunciaInterface[] = [];
  tipoDenuncia: string | null = null;
  tipoDenunciaId: number | null = null;
  isSpeaking: boolean = false;
  speakingIndex: number | null = null;
  pulsingStates: boolean[] = [];
  descripcionVisible: number | null = null;
  selectedDenunciaIndex: number | null = null;
  denunciaSelected: boolean = false;  // Flag para saber si se seleccionó denuncia

  private infosubtiposlist: string[] = [
    "Has llegado a la sección de subtipos de denuncia. Aquí puedes afinar más tu elección.",
    "Selecciona un subtipo de denuncia que represente mejor el incidente que quieres reportar.",
    "Haz clic en la imagen del subtipo para escuchar más detalles sobre la opción seleccionada.",
    "Recuerda que tu elección de subtipo ayudará a clasificar mejor tu denuncia para una respuesta más adecuada.",
    "Si tienes alguna duda, no dudes en hacer clic en el ícono de información para recibir más ayuda.",
    "Gracias por seguir este proceso. Cada denuncia ayuda a mejorar la seguridad de todos."
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private denunciasService: DenunciasService,
    private toastr: ToastrService,
    private botInfoService: BotInfoService,
    private denunciaStorage: DenunciaStorageService
  ) { }

  ngOnInit(): void {
    // Obtenemos el nombre del tipo de denuncia desde la ruta
    this.route.params.subscribe(params => {
      this.tipoDenuncia = params['nombreTipoDenuncia'];
      if (this.tipoDenuncia) {
        this.obtenerTipoDenunciaId(this.tipoDenuncia);
      }
    });
    this.botInfoService.setInfoList(this.infosubtiposlist);
  }

  /**
   * Obtiene el id del tipo de denuncia a partir del nombre.
   * Se consulta la lista de tipos y se filtra por el nombre.
   */
  obtenerTipoDenunciaId(nombreTipo: string): void {
    this.denunciasService.getTiposDenunciaAnonimas().subscribe({
      next: (tipos: TipoDenunciaInterface[]) => {
        const tipoEncontrado = tipos.find(tipo => tipo.nombre === nombreTipo);
        if (tipoEncontrado) {
          this.tipoDenunciaId = tipoEncontrado.id;
          // Una vez obtenido el id, se filtran los subtipos
          this.obtenerSubtiposPorTipoId(this.tipoDenunciaId);
        } else {
          this.toastr.error('Tipo de denuncia no encontrado', 'Error');
        }
      },
      error: (err) => {
        this.toastr.error('Error al obtener el tipo de denuncia', 'Error');
        console.error(err);
      }
    });
  }

  /**
   * Obtiene todos los subtipos y filtra aquellos que pertenecen al tipo (por id) recibido.
   */
  obtenerSubtiposPorTipoId(tipoId: number): void {
    this.denunciasService.getSubtiposDenuncia().subscribe({
      next: (subtipos: SubtipoDenunciaInterface[]) => {
        // Filtrar por tipoDenunciaId
        this.subtipos = subtipos.filter(subtipo => subtipo.tipoDenunciaId === tipoId);
        this.pulsingStates = new Array(this.subtipos.length).fill(true);
      },
      error: (err) => {
        this.toastr.error('Error al obtener los subtipos de denuncia', 'Error');
        console.error(err);
      }
    });
  }

  toggleDescripcion(index: number): void {
    this.descripcionVisible = this.descripcionVisible === index ? null : index;
    this.stopPulse(index);
  }

  selectDenuncia(index: number): void {
    this.selectedDenunciaIndex = this.selectedDenunciaIndex === index ? null : index;
    this.denunciaSelected = this.selectedDenunciaIndex !== null;
    this.stopPulse(index);
  }

  getImageUrl(flagImage: string): string {
    if (!flagImage) {
      return '../../../../../../assets/img/default-denuncia.png'; // Imagen por defecto
    }
    return `${environment.endpoint}uploads/subtipoDenuncias/subtipo/${flagImage}`;
  }

  speakDenuncia(index: number): void {
    if (this.isSpeaking && this.speakingIndex === index) {
      return;
    }

    const subtipo = this.subtipos[index];
    if (subtipo) {
      const name = subtipo.nombre;
      const description = subtipo.descripcion || 'No hay descripción disponible';

      this.botInfoService.cancelSpeak();

      this.isSpeaking = true;
      this.speakingIndex = index;
      this.stopPulse(index);

      this.botInfoService.speak(name)
        .then(() => this.botInfoService.speak(description))
        .then(() => {
          this.isSpeaking = false;
          this.speakingIndex = null;
        })
        .catch((error) => {
          console.error('Error al hablar:', error);
          this.isSpeaking = false;
          this.speakingIndex = null;
        });
    }
  }

  handleContinue(): void {
    if (this.selectedDenunciaIndex === null) {
      this.toastr.error('Por favor, selecciona una denuncia para continuar.', 'Error');
      return;
    }

    // Obtener el nombre del subtipo seleccionado
    const selectedSubtipo = this.subtipos[this.selectedDenunciaIndex];
    if (selectedSubtipo) {
      // Guardar en el storage
      this.denunciaStorage.setSubtipoDenuncia(selectedSubtipo.nombre);
      // Navegar
      this.router.navigate(['/body/evidencia', { nombreSubTipoDenuncia: selectedSubtipo.nombre }]);
    }
  }

  stopPulse(index: number): void {
    this.pulsingStates[index] = false;
  }

  isPulsing(index: number): boolean {
    return this.pulsingStates[index];
  }
}
