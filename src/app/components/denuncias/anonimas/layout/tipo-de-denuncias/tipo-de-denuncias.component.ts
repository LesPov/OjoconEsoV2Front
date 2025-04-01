import { Component, HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { environment } from '../../../../../../environments/environment';
import { BotInfoService } from '../../../../admin/layout/utils/botInfoCliente';
import { TipoDenunciaInterface } from '../../../../admin/middleware/interfaces/tipoDenunciaInterface';
import { DenunciasService } from '../../../middleware/services/denuncias.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../navbar/navbar.component';
import { DenunciaStorageService } from '../../../middleware/services/denunciaStorage.service';

@Component({
  selector: 'app-tipo-de-denuncias',
  imports: [CommonModule, FormsModule, NavbarComponent],
  templateUrl: './tipo-de-denuncias.component.html',
  styleUrls: ['./tipo-de-denuncias.component.css']
})
export class TipoDeDenunciasComponent implements OnInit {
  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.handleScrollUpVisibility();
  }

  // Lista de denuncias obtenida del servicio
  tiposDenunciasAnonimas: TipoDenunciaInterface[] = [];
  // Controla la visibilidad de la descripción (índice o null)
  descripcionVisible: number | null = null;
  // Guarda el índice de la denuncia seleccionada (null si ninguna)
  selectedDenunciaIndex: number | null = null;
  // Propiedad booleana para el estado de selección (para evitar confusiones con índice 0)
  isDenunciaSeleccionada: boolean = false;
  // Variables para controlar el efecto "speak" y "pulse"
  isSpeaking: boolean = false;
  speakingIndex: number | null = null;
  pulsingStates: boolean[] = [];

  // Lista de mensajes de ayuda (opcional)
  private infoListAnonima: string[] = [
    "Estás en la sección de denuncias anónimas. Aquí puedes reportar sin revelar tu identidad.",
    "Estos son los tipos de denuncias que tenemos disponibles. Selecciona una para obtener más detalles.",
    "Haz clic en la imagen de cualquier denuncia para consultar más información sobre ella.",
    "Si deseas hacer seguimiento de tu denuncia, recibirás un código al finalizar.",
    "Para obtener acceso a funciones avanzadas, regístrate e inicia sesión."
  ];

  constructor(
    private denunciasService: DenunciasService,
    private router: Router,
    private toastr: ToastrService,
    private botInfoService: BotInfoService,
    private denunciaStorage: DenunciaStorageService

  ) { }

  ngOnInit(): void {
    this.obtenerTiposDenunciaAnonimas();
    this.botInfoService.setInfoList(this.infoListAnonima);
  }

  // Obtiene y filtra las denuncias según "Anónima" o "Ambas"
  obtenerTiposDenunciaAnonimas(): void {
    this.denunciasService.getTiposDenunciaAnonimas().subscribe({
      next: (tipos) => {
        this.tiposDenunciasAnonimas = tipos.filter(
          tipo => tipo.esAnonimaOficial === 'Anónima' || tipo.esAnonimaOficial === 'Ambas'
        );
        // Inicializa el efecto "pulse"
        this.pulsingStates = new Array(this.tiposDenunciasAnonimas.length).fill(true);
        console.log('Denuncias obtenidas:', this.tiposDenunciasAnonimas);
      },
      error: (err) => {
        this.toastr.error('Error al obtener las denuncias anónimas', 'Error');
        console.error(err);
      }
    });
  }

  // Alterna la visibilidad de la descripción y detiene el "pulse"
  toggleDescripcion(index: number): void {
    this.descripcionVisible = this.descripcionVisible === index ? null : index;
    this.stopPulse(index);
    console.log(`Toggle descripción para denuncia ${index}. Valor actual: ${this.descripcionVisible}`);
  }

  // Selecciona o deselecciona una denuncia
  selectDenuncia(index: number): void {
    if (this.selectedDenunciaIndex === index) {
      this.selectedDenunciaIndex = null;
      this.isDenunciaSeleccionada = false;
    } else {
      this.selectedDenunciaIndex = index;
      this.isDenunciaSeleccionada = true;
    }
    this.stopPulse(index);
  }

  // Reproduce el nombre y la descripción de la denuncia
  speakDenuncia(index: number): void {
    if (this.isSpeaking && this.speakingIndex === index) { return; }
    const denuncia = this.tiposDenunciasAnonimas[index];
    if (denuncia) {
      const name = denuncia.nombre;
      const description = denuncia.descripcion || 'No hay descripción disponible';
      this.botInfoService.cancelSpeak();
      this.isSpeaking = true;
      this.speakingIndex = index;
      this.stopPulse(index);
      console.log(`Hablando denuncia ${index}: ${name} - ${description}`);
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

  // Retorna la URL de la imagen o una por defecto
  getImageUrl(flagImage: string): string {
    if (!flagImage) {
      return '../../../../../../assets/img/default-denuncia.png';
    }
    return `${environment.endpoint}uploads/tipoDenuncias/tipo/${flagImage}`;
  }

  // Se ejecuta al presionar "Continuar" en el Navbar
  handleContinue(): void {
    if (this.selectedDenunciaIndex === null) {
      this.toastr.error('Por favor, selecciona una denuncia para continuar.', 'Error');
      return;
    }

    const selectedDenuncia = this.tiposDenunciasAnonimas[this.selectedDenunciaIndex];
    if (selectedDenuncia) {
      // Guardar en el storage
      this.denunciaStorage.setTipoDenuncia(selectedDenuncia.nombre);
      // Navegar
      this.router.navigate(['../body/subtipos_de_denuncia', { nombreTipoDenuncia: selectedDenuncia.nombre }]);
    }
  }

  // Detiene el efecto "pulse" en la imagen
  stopPulse(index: number): void {
    this.pulsingStates[index] = false;
  }

  // Retorna true si la imagen debe tener el efecto "pulse"
  isPulsing(index: number): boolean {
    return this.pulsingStates[index];
  }

  // Controla la visibilidad del botón "scroll-up" al hacer scroll
  private handleScrollUpVisibility(): void {
    const scrollUpElement = document.getElementById('scroll-up');
    if (scrollUpElement) {
      if (window.scrollY >= 560) {
        scrollUpElement.classList.add('show-scroll');
        scrollUpElement.classList.remove('scrollup--inactive');
      } else {
        scrollUpElement.classList.remove('show-scroll');
        scrollUpElement.classList.add('scrollup--inactive');
      }
    }
  }

  // Desplaza la ventana al tope de la página
  scrollToTop(): void {
    const scrollStep = -window.scrollY / 20;
    const scrollInterval = setInterval(() => {
      if (window.scrollY !== 0) {
        window.scrollBy(0, scrollStep);
      } else {
        clearInterval(scrollInterval);
        const scrollUpElement = document.getElementById('scroll-up');
        if (scrollUpElement) {
          scrollUpElement.classList.add('scrollup--inactive');
        }
      }
    }, 20);
  }
}
