import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { environment } from '../../../../../../environments/environment';
import { AdminUser, AdminService } from '../../../services/adminService';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription, interval } from 'rxjs';
import { UserStatusService } from '../../utils/user-status.service';
import { Profile } from '../../../../profile/interfaces/profileInterfaces';
import { ProfileService } from '../../../../profile/services/profileServices';
// Importa el ProfileService y la interface Profile


@Component({
  selector: 'app-user-summary',
  imports: [RouterModule, CommonModule, FormsModule],
  templateUrl: './user-summary.component.html',
  styleUrls: ['./user-summary.component.css']
})
export class UserSummaryComponent implements OnInit, OnDestroy {
  userId!: number;
  user!: AdminUser | undefined;
  errorMessage: string = '';
  profile!: Profile | null;

  // Suscripción a los cambios del status global
  statusSubscription!: Subscription;
  // Polling para actualizar el status (o información del usuario) en tiempo real
  pollingSubscription!: Subscription;

  // Suscripción para el perfil
  profileSubscription!: Subscription;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private adminService: AdminService,
    private userStatusService: UserStatusService,
    private profileService: ProfileService // Inyecta el servicio de perfil
  ) { }

  ngOnInit(): void {
    // Extraer el id de la URL
    this.userId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadUser();

    // Cargar el perfil del usuario
    this.loadProfile();

    // Suscribirse a los cambios de status global
    this.statusSubscription = this.userStatusService.status$.subscribe(status => {
      if (this.user) {
        // Actualiza únicamente el status, sin tocar el resto de la información
        this.user.status = status as 'Activado' | 'Desactivado';
      }
    });

    // Polling para actualizar el status cada 5 segundos
    this.pollingSubscription = interval(5000).subscribe(() => this.updateUserStatus());
  }

  ngOnDestroy(): void {
    if (this.statusSubscription) {
      this.statusSubscription.unsubscribe();
    }
    if (this.pollingSubscription) {
      this.pollingSubscription.unsubscribe();
    }
    if (this.profileSubscription) {
      this.profileSubscription.unsubscribe();
    }
  }

  // Carga completa de la información del usuario (se usa una sola vez al inicio)
  loadUser(): void {
    this.adminService.getAllUsers().subscribe({
      next: (data: AdminUser[]) => {
        this.user = data.find(u => u.id === this.userId);
        if (!this.user) {
          this.errorMessage = 'Usuario no encontrado.';
        }
      },
      error: (err) => {
        console.error("Error al obtener usuarios:", err);
        this.errorMessage = 'No se pudo cargar la información del usuario.';
      }
    });
  }

  // Método para cargar el perfil del usuario
  loadProfile(): void {
    this.profileSubscription = this.profileService.getProfile().subscribe({
      next: (profileData: Profile) => {
        this.profile = profileData;
      },
      error: (err) => {
        console.error("Error al cargar perfil:", err);
        // Puedes definir un mensaje de error específico para el perfil
      }
    });
  }

  // Método de polling: consulta nuevamente el status del usuario
  updateUserStatus(): void {
    this.adminService.getAllUsers().subscribe({
      next: (data: AdminUser[]) => {
        const updatedUser = data.find(u => u.id === this.userId);
        if (updatedUser && this.user) {
          // Actualiza el status sin sobrescribir otros datos ya cargados
          this.user.status = updatedUser.status;
        }
      },
      error: (err) => {
        console.error("Error al actualizar el status del usuario:", err);
      }
    });
  }

  getImageUrl(profilePicture: string): string {
    if (!profilePicture) {
      return '../../../../../../assets/img/default-user.png';
    }
    return `${environment.endpoint}uploads/client/profile/${profilePicture}`;
  }

  goBack(): void {
    this.router.navigate(['/admin/users']);
  }

  // Método para asignar la clase CSS correspondiente al status
  getStatusClass(status: string): string {
    if (!status) return 'status-default';
    switch (status.toLowerCase()) {
      case 'activado':
        return 'status-activado';
      case 'desactivado':
        return 'status-desactivado';
      default:
        return 'status-default';
    }
  }
}
