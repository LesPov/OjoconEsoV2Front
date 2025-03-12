import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener } from '@angular/core';

@Component({
  selector: 'app-header',
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  // Controla la visibilidad del dropdown
  dropdownVisible: boolean = false;

  constructor(private elementRef: ElementRef) {}

  // Alterna la visibilidad del menú desplegable
  toggleDropdown(): void {
    this.dropdownVisible = !this.dropdownVisible;
  }

  // Escucha clics en todo el documento
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    // Si el dropdown está visible y el clic ocurre fuera del componente, lo ocultamos.
    if (this.dropdownVisible && !this.elementRef.nativeElement.contains(event.target)) {
      this.dropdownVisible = false;
    } 
  }
}