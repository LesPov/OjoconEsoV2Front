import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { environment } from '../../../../../../environments/environment';
import { BotInfoService } from '../../../../admin/layout/utils/botInfoCliente';
import { SubtipoDenunciaInterface } from '../../../../admin/middleware/interfaces/subtipoDenunciaInterface';
import { TipoDenunciaInterface } from '../../../../admin/middleware/interfaces/tipoDenunciaInterface';
import { DenunciasService } from '../../../middleware/services/denuncias.service';
import { DenunciaAnonimaStorageService } from '../../../middleware/services/denunciaStorage.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../navbar/navbar.component';
import { DenunciaOficialStorageService } from '../../../middleware/services/denuncia-oficial-storage.service';

@Component({
  selector: 'app-subtipos-de-denuncias',
  imports: [FormsModule, CommonModule, NavbarComponent],
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
  tipoDenunciaNombre: string | null = null; // Cambiado de tipoDenuncia para claridad
  modo: 'anonima' | 'oficial' = 'anonima'; // <-- NECESITAS LEER Y GUARDAR ESTO

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
    private denunciaAnonimaStorage: DenunciaAnonimaStorageService, // Inyectado con alias
    private denunciaOficialStorage: DenunciaOficialStorageService  // Inyectado

  ) { }

  ngOnInit(): void {
    this.route.queryParamMap.subscribe(queryParams => {
      // 1. Leer el MODO (tipo)
      const t = queryParams.get('tipo');
      this.modo = t === 'oficial' ? 'oficial' : 'anonima';
      console.log('SUBTIPOS - Modo recibido:', this.modo);

      // 2. Leer el NOMBRE del tipo de denuncia padre
      this.tipoDenunciaNombre = queryParams.get('nombreTipoDenuncia');
      console.log('SUBTIPOS - NombreTipo recibido:', this.tipoDenunciaNombre);

      if (this.tipoDenunciaNombre) {
        // Si tenemos nombre, buscamos su ID para poder filtrar subtipos
        this.obtenerTipoDenunciaIdYSubtipos(this.tipoDenunciaNombre);
      } else {
        this.toastr.error('No se especificó el tipo de denuncia padre.', 'Error de Navegación');
        console.error("SUBTIPOS - Falta queryParam 'nombreTipoDenuncia'");
        // Considera redirigir si falta un dato esencial
        // this.router.navigate(['/body/tipos_de_denuncia'], { queryParams: { tipo: this.modo }, queryParamsHandling: 'merge' });
      }
    });

    this.botInfoService.setInfoList(this.infosubtiposlist);
  }

  /**
    * Obtiene el ID del tipo por nombre y luego carga los subtipos filtrados.
    */
  obtenerTipoDenunciaIdYSubtipos(nombreTipo: string): void {
    // Usamos getTiposDenuncia con el modo correcto para encontrar el ID
    this.denunciasService.getTiposDenuncia(this.modo).subscribe({
      next: tipos => {
        const encontrado = tipos.find(t => t.nombre === nombreTipo);
        if (!encontrado || typeof encontrado.id === 'undefined') {
          this.toastr.error(`Tipo de denuncia llamado "${nombreTipo}" no encontrado para el modo "${this.modo}".`, 'Error');
          console.error(`Tipo "${nombreTipo}" no hallado en:`, tipos);
          this.subtipos = []; // Limpiar subtipos si no se encuentra el padre
          return;
        }
        this.tipoDenunciaId = encontrado.id;
        console.log(`SUBTIPOS - ID encontrado para "${nombreTipo}": ${this.tipoDenunciaId}`);
        // Ahora que tenemos el ID, filtramos los subtipos
        this.obtenerSubtiposFiltrados(this.tipoDenunciaId);
      },
      error: err => {
        console.error("Error fetching tipos para buscar ID:", err);
        this.toastr.error('Error al verificar el tipo de denuncia padre.', 'Error de Red');
      }
    });
  }
  /**
  * Obtiene TODOS los subtipos y luego filtra por el tipoDenunciaId.
  */
  obtenerSubtiposFiltrados(tipoId: number): void {
    this.denunciasService.getSubtiposDenuncia().subscribe({
      next: (todosLosSubtipos) => {
        this.subtipos = todosLosSubtipos.filter(subtipo => subtipo.tipoDenunciaId === tipoId);
        console.log(`SUBTIPOS - Filtrados para tipoId ${tipoId}:`, this.subtipos);
        if (this.subtipos.length === 0) {
          this.toastr.info(`No se encontraron subtipos específicos para "${this.tipoDenunciaNombre}".`);
        }
        this.pulsingStates = new Array(this.subtipos.length).fill(true);
        // Reiniciar selección si cambian los subtipos
        this.selectedDenunciaIndex = null;
        this.descripcionVisible = null;
      },
      error: (err) => {
        this.toastr.error('Error al obtener los subtipos de denuncia.', 'Error de Red');
        console.error("Error fetching subtipos:", err);
        this.subtipos = []; // Limpiar en caso de error
      }
    });
  }
  /**
   * Obtiene el id del tipo de denuncia a partir del nombre.
   * Se consulta la lista de tipos y se filtra por el nombre.
   */
  obtenerTipoDenunciaId(nombreTipo: string): void {
    // 2) Usamos getTiposDenuncia con el modo correcto
    this.denunciasService.getTiposDenuncia(this.modo).subscribe({
      next: tipos => {
        const encontrado = tipos.find(t => t.nombre === nombreTipo);
        if (!encontrado) {
          this.toastr.error('Tipo de denuncia no encontrado', 'Error');
          return;
        }
        this.tipoDenunciaId = encontrado.id;
        this.obtenerSubtiposPorTipoId(this.tipoDenunciaId);
      },
      error: err => {
        console.error(err);
        this.toastr.error('Error al obtener los tipos de denuncia', 'Error');
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
      this.toastr.error('Por favor, selecciona un subtipo de denuncia para continuar.', 'Error');
      return;
    }

    const selectedSubtipo = this.subtipos[this.selectedDenunciaIndex!]; // Usar '!' si estás seguro que no será null
    if (!selectedSubtipo) {
      this.toastr.error('Error al obtener el subtipo seleccionado.', 'Error Interno');
      return;
    }

    if (!this.modo) {
      console.error("SUBTIPOS - Error crítico: Falta 'modo' ('tipo') para navegar a Evidencia.");
      this.toastr.error("Error interno al procesar el tipo de denuncia.");
      return;
    }

    // --- LÓGICA PARA SELECCIONAR EL STORAGE ---
    if (this.modo === 'oficial') {
      this.denunciaOficialStorage.setSubtipoDenuncia(selectedSubtipo.nombre);
      console.log(`SUBTIPOS - Guardado en OFICIAL Storage: ${selectedSubtipo.nombre}`);
    } else {
      // Por defecto o si this.modo es 'anonima'
      this.denunciaAnonimaStorage.setSubtipoDenuncia(selectedSubtipo.nombre);
      console.log(`SUBTIPOS - Guardado en ANÓNIMA Storage: ${selectedSubtipo.nombre}`);
    }
    // -----------------------------------------

    console.log(`SUBTIPOS - Navegando a Evidencia. Modo actual: ${this.modo}, Subtipo Seleccionado: ${selectedSubtipo.nombre}`);

    this.router.navigate(
      ['/body/evidencia'],
      {
        queryParams: {
          tipo: this.modo,                      // Pasar el modo actual
          nombreSubtipo: selectedSubtipo.nombre // Pasar el nombre del subtipo
          // Opcional: nombreTipo: this.tipoDenunciaNombre si Evidencia lo necesita
        },
        queryParamsHandling: 'merge'
      }
    );
  }

  stopPulse(index: number): void {
    this.pulsingStates[index] = false;
  }

  isPulsing(index: number): boolean {
    return this.pulsingStates[index];
  }
}
