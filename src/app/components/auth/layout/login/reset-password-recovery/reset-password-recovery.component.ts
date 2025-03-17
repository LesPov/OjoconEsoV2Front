import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { authService } from '../../../services/auths';

@Component({
  selector: 'app-reset-password-recovery',
  imports: [FormsModule],
  templateUrl: './reset-password-recovery.component.html',
  styleUrl: './reset-password-recovery.component.css'
})
export class ResetPasswordRecoveryComponent {
  usernameOrEmail: string = '';
  randomPassword: string = '';
  newPassword: string = '';
  confirmNewPassword: string = '';
  loading: boolean = false;
  token: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: authService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    // Capturamos el token y, opcionalmente, el username si se envían en la URL
    this.token = this.route.snapshot.queryParamMap.get('token') || '';
    this.usernameOrEmail = this.route.snapshot.queryParamMap.get('usernameOrEmail') || '';
  }

  resetPassword(form: NgForm): void {
    if (form.invalid) {
      this.toastr.error('Por favor, completa todos los campos requeridos', 'Error');
      return;
    }
    if (this.newPassword !== this.confirmNewPassword) {
      this.toastr.error('Las contraseñas no coinciden', 'Error');
      return;
    }
    this.loading = true;
    this.authService.resetPassword(this.usernameOrEmail, this.randomPassword, this.newPassword, this.token)
      .subscribe({
        next: () => {
          this.loading = false;
          this.toastr.success('Contraseña actualizada correctamente', 'Éxito');
          this.router.navigate(['/auth/login']);
        },
        error: (err) => {
          this.loading = false;
          this.toastr.error(err.error.msg || 'Error al restablecer la contraseña', 'Error');
        }
      });
  }
}