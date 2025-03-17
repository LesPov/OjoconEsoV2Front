import { Component } from '@angular/core';
import { authService } from '../../../services/auths';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { FormsModule, NgForm } from '@angular/forms';

@Component({
  selector: 'app-password-recovery',
  imports: [FormsModule],
  templateUrl: './password-recovery.component.html',
  styleUrl: './password-recovery.component.css'
})
export class PasswordRecoveryComponent {
  usernameOrEmail: string = '';
  loading: boolean = false;

  constructor(
    private authService: authService,
    private toastr: ToastrService,
    private router: Router
  ) { }

  ngOnInit(): void {}

  requestPasswordReset(form: NgForm): void {
    if (form.invalid || this.usernameOrEmail.trim() === '') {
      this.toastr.error('Por favor ingresa tu correo o nombre de usuario', 'Error');
      return;
    }
    this.loading = true;
    this.authService.requestPasswordReset(this.usernameOrEmail).subscribe({
      next: () => {
        this.loading = false;
        this.toastr.success('Se ha enviado un correo para la recuperación de contraseña', 'Éxito');
        // Puedes redirigir al usuario al login u otra pantalla
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.loading = false;
        this.toastr.error(err.error.msg || 'Error al solicitar la recuperación de contraseña', 'Error');
      }
    });
  }
}