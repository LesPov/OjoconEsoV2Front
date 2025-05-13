import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { BotInfoService } from '../../admin/layout/utils/botInfoCliente';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-inicio',
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './inicio.component.html',
  styleUrls: ['./inicio.component.css']  // Nota: usa styleUrls (con "s")
})
export class InicioComponent {
  currentModal: string | null = null;
  modalTitle: string = '';
  callUrl: string = '';
  navigateRoute: string = '';
  showWelcomeComponent: boolean = true; // Configura según tu lógica

  constructor(private router: Router,
    private toastr: ToastrService,
  ) { }

  openModal(title: string, callUrl: string, route: string): void {
    this.currentModal = title;
    this.modalTitle = title;
    this.callUrl = callUrl;
    this.navigateRoute = route;
  }
  showwarnig(): void {
    this.toastr.warning('En próximas actualizaciones se agregará.', 'Warning');
  }
  closeModal(): void {
    this.currentModal = null;
  }

  makeCall(): void {
    window.location.href = this.callUrl;
  }

  navigateToRoute(): void {
    if (this.navigateRoute) {
      this.router.navigate([this.navigateRoute]);
    } else {
      this.toastr.error('No se pudo navegar. Ruta no definida.', 'Error');
    }
  }
}
