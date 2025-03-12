import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-biembenido',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './bienvenido.component.html',
  styleUrl: './bienvenido.component.css'
})
export class BiembenidoComponent implements OnInit {
  showModal: boolean = true;  // El modal comienza visible

  constructor(private router: Router) {}

  ngOnInit() {
    // Automáticamente cerrar el modal después de 5 segundos y redirigir al home
    setTimeout(() => {
      this.closeModal();
    }, 3500);  // 5000 ms = 5 segundos
  }

  closeModal() {
    this.showModal = false;  // Cierra el modal
    localStorage.setItem('modalShown', 'true');  // Guarda en localStorage que el modal ya fue mostrado
    this.router.navigate(['/auth/login']);  // Redirige al home
  }
}