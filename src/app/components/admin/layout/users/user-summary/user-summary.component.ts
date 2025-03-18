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
import { ToastrService } from 'ngx-toastr';

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
  selectedFile: File | null = null;
  isModified: boolean = false;

  statusSubscription!: Subscription;
  pollingSubscription!: Subscription;
  profileSubscription!: Subscription;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private adminService: AdminService,
    private userStatusService: UserStatusService,
    private toastr: ToastrService,
    private profileService: ProfileService
  ) { }

  ngOnInit(): void {
    this.userId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadUser();
    this.loadProfile();

    this.statusSubscription = this.userStatusService.status$.subscribe(status => {
      if (this.user) {
        this.user.status = status as 'Activado' | 'Desactivado';
      }
    });

    this.pollingSubscription = interval(5000).subscribe(() => this.updateUserStatus());
  }

  ngOnDestroy(): void {
    if (this.statusSubscription) this.statusSubscription.unsubscribe();
    if (this.pollingSubscription) this.pollingSubscription.unsubscribe();
    if (this.profileSubscription) this.profileSubscription.unsubscribe();
  }

  setModified(): void {
    this.isModified = true;
  }

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

  loadProfile(): void {
    this.profileSubscription = this.profileService.getProfile().subscribe({
      next: (profileData: Profile) => {
        this.profile = profileData;
      },
      error: (err) => {
        console.error("Error al cargar perfil:", err);
      }
    });
  }

  updateUserStatus(): void {
    this.adminService.getAllUsers().subscribe({
      next: (data: AdminUser[]) => {
        const updatedUser = data.find(u => u.id === this.userId);
        if (updatedUser && this.user) {
          this.user.status = updatedUser.status;
        }
      },
      error: (err) => {
        console.error("Error al actualizar el status del usuario:", err);
      }
    });
  }

  onFileSelected(event: Event): void {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
      this.selectedFile = target.files[0];
      this.isModified = true;
    }
  }

  buildUserFormData(): FormData {
    const formData = new FormData();
    if (this.user) {
      formData.append('username', this.user.username);
      formData.append('email', this.user.email);
      formData.append('rol', this.user.rol);
      // Incluimos el phoneNumber si existe
      if (this.user.phoneNumber) {
        formData.append('phoneNumber', this.user.phoneNumber);
      }
      if (this.selectedFile) {
        formData.append('profilePicture', this.selectedFile);
      }
    }
    return formData;
  }

  updateUser(): void {
    if (!this.isModified) {
      this.toastr.info('No se han realizado cambios para actualizar', 'Información');
      return;
    }
    if (!this.user) return;
    
    const formData = this.buildUserFormData();
    this.adminService.updateUser(this.user.id, formData).subscribe({
      next: () => {
        this.toastr.success('Perfil actualizado exitosamente', 'Éxito');
        this.isModified = false;
        this.selectedFile = null;
        this.loadUser();
      },
      error: (err) => {
        this.toastr.error(err.error.msg || 'Error al actualizar el usuario', 'Error');
        this.errorMessage = 'Error al actualizar el usuario.';
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
