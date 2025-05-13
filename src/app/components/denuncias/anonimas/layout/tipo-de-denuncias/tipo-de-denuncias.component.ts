import { Component, HostListener, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { environment } from '../../../../../../environments/environment';
import { BotInfoService } from '../../../../admin/layout/utils/botInfoCliente';
import { TipoDenunciaInterface } from '../../../../admin/middleware/interfaces/tipoDenunciaInterface';
import { DenunciasService } from '../../../middleware/services/denuncias.service';
import { DenunciaAnonimaStorageService } from '../../../middleware/services/denunciaStorage.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../navbar/navbar.component';
import { DenunciaOficialStorageService } from '../../../middleware/services/denuncia-oficial-storage.service';

@Component({
  selector: 'app-tipo-de-denuncias',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  templateUrl: './tipo-de-denuncias.component.html',
  styleUrls: ['./tipo-de-denuncias.component.css']
})
export class TipoDeDenunciasComponent implements OnInit {
  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.handleScrollUpVisibility();
  }

  /** Lista genérica de tipos (anónimas u oficiales) */
  modo: 'anonima' | 'oficial' = 'anonima';
  tiposDenuncias: TipoDenunciaInterface[] = [];

  descripcionVisible: number | null = null;
  selectedDenunciaIndex: number | null = null;
  isSpeaking = false;
  speakingIndex: number | null = null;
  pulsingStates: boolean[] = [];

  private infoList: string[] = [
    "Selecciona el tipo de denuncia para continuar.",
    "Puedes hacer clic en el icono para escuchar la descripción.",
    "Usa el checkbox para elegir y luego presiona continuar."
  ];

  constructor(
    private denunciasService: DenunciasService,
    private router: Router,
    private route: ActivatedRoute,
    private toastr: ToastrService,
    private botInfoService: BotInfoService,
    private denunciaAnonimaStorage: DenunciaAnonimaStorageService, // Inyectado con alias
    private denunciaOficialStorage: DenunciaOficialStorageService  // Inyectado

  ) { }
  ngOnInit(): void {
    // 1) Leemos siempre el queryParam 'tipo'
    this.route.queryParamMap.subscribe(params => {
      const t = params.get('tipo');
      // Asigna 'oficial' solo si es exactamente 'oficial', si no, 'anonima'
      this.modo = t === 'oficial' ? 'oficial' : 'anonima';
      console.log('TIPOS - Modo establecido:', this.modo); // Log para depurar

      // Cada vez que cambie el modo, recargamos
      this.fetchTipos();
    });

    this.botInfoService.setInfoList(this.infoList);
  }

  private fetchTipos(): void {
    // Ya estaba bien: usa this.modo para obtener los tipos correctos
    this.denunciasService.getTiposDenuncia(this.modo).subscribe({
      next: tipos => {
        this.tiposDenuncias = tipos;
        this.pulsingStates = tipos.map(() => true);
      },
      error: (err) => { // Añadir manejo de error específico
        console.error("Error fetching tipos:", err);
        this.toastr.error('No se pudieron obtener los tipos de denuncia', 'Error de Red');
        this.tiposDenuncias = []; // Limpiar en caso de error
      }
    });
  }



  toggleDescripcion(i: number) {
    this.descripcionVisible = this.descripcionVisible === i ? null : i;
    this.stopPulse(i);
  }

  selectDenuncia(i: number) {
    if (this.selectedDenunciaIndex === i) {
      this.selectedDenunciaIndex = null;
    } else {
      this.selectedDenunciaIndex = i;
    }
    this.stopPulse(i);
  }

  speakDenuncia(i: number) {
    if (this.isSpeaking && this.speakingIndex === i) return;
    const d = this.tiposDenuncias[i];
    if (!d) return;
    this.botInfoService.cancelSpeak();
    this.isSpeaking = true;
    this.speakingIndex = i;
    this.stopPulse(i);
    this.botInfoService.speak(d.nombre)
      .then(() => this.botInfoService.speak(d.descripcion || ''))
      .finally(() => {
        this.isSpeaking = false;
        this.speakingIndex = null;
      });
  }

  getImageUrl(flag: string) {
    return flag
      ? `${environment.endpoint}uploads/tipoDenuncias/tipo/${flag}`
      : '../../../../../../assets/img/default-denuncia.png';
  }

 handleContinue() {
    // ... (validaciones)
    const sel = this.tiposDenuncias[this.selectedDenunciaIndex!];

    if (this.modo === 'oficial') {
      this.denunciaOficialStorage.setTipoDenuncia(sel.nombre); // Llama al servicio OFICIAL
      console.log(`TIPOS - Guardado en OFICIAL Storage: ${sel.nombre}`);
    } else {
      this.denunciaAnonimaStorage.setTipoDenuncia(sel.nombre); // Llama al servicio ANÓNIMO
      console.log(`TIPOS - Guardado en ANÓNIMA Storage: ${sel.nombre}`);
    }

    // ... (navegación, pasando el 'modo' como queryParam 'tipo')
    this.router.navigate(
        ['/body/subtipos_de_denuncia'],
        {
          queryParams: {
            tipo: this.modo, // Esencial para el siguiente componente
            nombreTipoDenuncia: sel.nombre
          },
          queryParamsHandling: 'merge'
        }
    );
  }

  stopPulse(i: number) {
    this.pulsingStates[i] = false;
  }
  isPulsing(i: number) {
    return this.pulsingStates[i];
  }

  private handleScrollUpVisibility() {
    const up = document.getElementById('scroll-up');
    if (!up) return;
    if (window.scrollY >= 560) {
      up.classList.add('show-scroll');
      up.classList.remove('scrollup--inactive');
    } else {
      up.classList.remove('show-scroll');
      up.classList.add('scrollup--inactive');
    }
  }

  scrollToTop() {
    const step = -window.scrollY / 20;
    const iv = setInterval(() => {
      if (window.scrollY) window.scrollBy(0, step);
      else {
        clearInterval(iv);
        document.getElementById('scroll-up')
          ?.classList.add('scrollup--inactive');
      }
    }, 16);
  }
}
