import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener } from '@angular/core';
import { ActivatedRoute, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { BotInfoService } from '../../../admin/layout/utils/botInfoCliente';

@Component({
  selector: 'app-header',
  imports: [CommonModule, RouterLink, RouterLinkActive], 
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {

  dropdownVisible: boolean = false;

  constructor(
    private router: Router, 
    private elementRef: ElementRef,
    private botInfoService: BotInfoService
  ) {}

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
    this.botInfoService.speakNextAndScroll()
      .catch((error) => console.error('Error en el bot:', error));
  }
}
