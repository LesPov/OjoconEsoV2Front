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

  ngOnInit() {
    // Automáticamente cerrar el modal después de 5 segundos y redirigir al home
    setTimeout(() => {
      this.closeModal();
    }, 3500);  // 5000 ms = 5 segundos
  }

  closeModal() {
    this.showModal = false;  // Cierra el modal
    localStorage.setItem('modalShown', 'true');  // Guarda en localStorage que el modal ya fue mostrado
    this.router.navigate(['/inicio']);  // Redirige al home
  }
}
