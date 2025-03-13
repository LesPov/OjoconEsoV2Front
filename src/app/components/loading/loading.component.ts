import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-loading',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './loading.component.html',
  styleUrls: ['./loading.component.css']
})
export class LoadingComponent implements OnInit {
  showModal: boolean = true; // El modal empieza visible

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Espera 3.5 segundos antes de iniciar el fade-out y redirigir
    setTimeout(() => {
      this.closeModal();
    }, 3500);
  }

  closeModal(): void {
    // Agregar la clase "fade-out" para animar la opacidad
    const modalOverlay = document.querySelector('.modal-overlay');
    if (modalOverlay) {
      modalOverlay.classList.add('fade-out');
    }
    // Esperar a que finalice la animación (0.5s) antes de navegar
    setTimeout(() => {
      localStorage.setItem('modalShown', 'true');
      this.router.navigate(['/auth/login']);
    }, 500);
  }
}
