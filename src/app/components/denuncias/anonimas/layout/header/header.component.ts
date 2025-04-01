import { CommonModule, Location } from '@angular/common'; 
import { Component, ElementRef, HostListener, Input, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { BotInfoService } from '../../../../admin/layout/utils/botInfoCliente';
import { filter, Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy {
  @Input() title: string = '';
  @Input() showSpeakButton: boolean = false;
  @Input() componentName: string = '';
  // Esta propiedad se actualizará con el tipo de denuncia seleccionado
  @Input() tipoDenuncia: string | null = null;

  private subscription: Subscription = new Subscription();
  dropdownVisible: boolean = false;

  constructor(
    private router: Router, 
    private location: Location,
    private activatedRoute: ActivatedRoute, 
    private elementRef: ElementRef,
    private botInfoService: BotInfoService
  ) {}

  ngOnInit(): void {
    // Actualizamos el header inicial según la ruta activa
    this.updateHeaderTitle();

    // Nos suscribimos a los eventos de navegación para actualizar el header dinámicamente
    const navEndSub = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.updateHeaderTitle();
      });
    this.subscription.add(navEndSub);
  }
  
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
   // Método para volver
   goBack(): void {
    this.location.back();
  }
  // Actualiza title, componentName y tipoDenuncia basándose en la ruta activa y sus parámetros
  private updateHeaderTitle(): void {
    let child = this.activatedRoute.firstChild;
    while (child && child.firstChild) {
      child = child.firstChild;
    }
    if (child && child.snapshot.data) {
      this.title = child.snapshot.data['title'] || this.title;
      this.componentName = child.snapshot.data['componentName'] || this.componentName;
      
      // Si estamos en la ruta de subtipos o evidencia, recuperamos el parámetro adecuado
      if (this.componentName === 'subtipos' || this.componentName === 'evidencia') {
        // Para 'subtipos' se usa 'nombreTipoDenuncia' y para 'evidencia' 'nombreSubTipoDenuncia'
        this.tipoDenuncia = child.snapshot.params['nombreSubTipoDenuncia'] 
          || child.snapshot.params['nombreTipoDenuncia'] 
          || child.snapshot.data['tipoDenuncia'] 
          || null;
      } else {
        this.tipoDenuncia = null;
      }
    }
  }
  

  // Alterna la visibilidad del menú desplegable
  toggleDropdown(): void {
    this.dropdownVisible = !this.dropdownVisible;
  }

  // Cierra el dropdown si se hace clic fuera del componente
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.dropdownVisible && !this.elementRef.nativeElement.contains(event.target)) {
      this.dropdownVisible = false;
    }
  }

  // Función para activar el bot de voz al hacer clic en el ícono
  speakBot(): void {
    if (this.botInfoService.isSpeakingNow()) {
      this.botInfoService.cancelSpeak();
    } else {
      const info = this.botInfoService.getNextInfo();
      this.botInfoService.speak(info)
        .catch((error) => console.error('Error en el bot:', error));
    }
  }
  
  // Retorna el título a mostrar; si es el componente de subtipos, combina el texto con el tipo seleccionado
  getTitle(): string {
    return this.componentName === 'subtipo' && this.tipoDenuncia
      ? `Subtipos de ${this.tipoDenuncia}`
      : this.title;
  }
}
