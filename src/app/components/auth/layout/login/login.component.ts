import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { auth } from '../../interfaces/auth';
import { authService } from '../../services/auths';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  user: auth = {
    username: '',
    password: '',
    email: '',
    passwordorrandomPassword: '',
  };
  loading: boolean = false;

  constructor(
    private toastr: ToastrService,
    private authService: authService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void { }

  loginUser() {
    if (!this.user.username || !this.user.passwordorrandomPassword) {
      this.toastr.error('Todos los campos son obligatorios', 'Error');
      return;
    }
  
    this.loading = true;
    this.authService.login(this.user).subscribe(
      (response) => {
        this.loading = false;
        if (response.token) {
          this.toastr.success(`Bienvenido, ${this.user.username}!`);
          // Guardamos token y userId en localStorage
          localStorage.setItem('token', response.token);
          if (response.userId) {
            localStorage.setItem('userId', response.userId);
          }
        
          // Si la contraseña es aleatoria, forzamos el cambio
          if (response.passwordorrandomPassword === 'randomPassword') {
            this.router.navigate(['login/change-password'], { queryParams: { username: this.user.username } });
          } else {
            // Redireccionamos según el rol
            switch(response.rol) {
              case 'admin':
                this.router.navigate(['/admin/dashboard']);
                break;
              case 'client':
                this.router.navigate(['/client']);
                break;
              case 'campesino':
                this.router.navigate(['/campesino/dashboard']);
                break;
              case 'constructoracivil':
                this.router.navigate(['/constructoracivil']);
                break;
              default:
                this.router.navigate(['/']);
                break;
            }
          }
        }
      },
      (error: HttpErrorResponse) => {
        this.loading = false;
        this.toastr.error(error.error.msg, 'Error');
      }
    );
  }
}
