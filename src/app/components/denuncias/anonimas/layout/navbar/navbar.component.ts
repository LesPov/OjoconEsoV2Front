import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  @Input() currentStep: number | null = null;
  @Input() totalSteps: number | null = null;
  @Input() denunciaSeleccionada = false;
  @Input() showDots = false;
  @Input() showStepCounter: boolean = false;

  @Output() continuar = new EventEmitter<void>();

  continuarPaso() {
    if (this.denunciaSeleccionada) {
      this.continuar.emit();
    }
  }
}
