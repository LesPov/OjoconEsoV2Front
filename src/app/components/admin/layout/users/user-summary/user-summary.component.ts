// Importa el servicio AdminService y el ProfileService si lo requieres; en este ejemplo usaremos AdminService para ambos.
import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { environment } from '../../../../../../environments/environment';
import { AdminUser, AdminService } from '../../../services/admin.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Profile } from '../../../../auth/layout/profile/interfaces/profileInterfaces';
import { interval, Subscription } from 'rxjs';
import { UserStatusService } from '../../../services/user-status.service';

@Component({
  selector: 'app-user-summary',
  imports: [RouterModule, CommonModule, FormsModule],
  templateUrl: './user-summary.component.html',
  styleUrls: ['./user-summary.component.css']
})
export class UserSummaryComponent implements OnInit, OnDestroy {
  userId!: number;
  user!: AdminUser | undefined;
  originalUser!: AdminUser;
  errorMessage: string = '';
  profile!: Profile | null;
  originalProfile!: Profile;

  // Para actualizar la imagen del usuario
  selectedFile: File | null = null;
  // Para actualizar la imagen del perfil (opcional)
  selectedProfileFile: File | null = null;

  // Banderas para detectar cambios
  isModified: boolean = false;
  isProfileModified: boolean = false;

  // Opciones de rol
  roles: string[] = ['user', 'admin', 'supervisor'];

  statusSubscription!: Subscription;
  pollingSubscription!: Subscription;
  profileSubscription!: Subscription;

  // Referencias a elementos <details>
  @ViewChild('userDetails') userDetails!: ElementRef;
  @ViewChild('profileDetails') profileDetails!: ElementRef;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private adminService: AdminService,
    private userStatusService: UserStatusService,
    private toastr: ToastrService
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
    this.statusSubscription?.unsubscribe();
    this.pollingSubscription?.unsubscribe();
    this.profileSubscription?.unsubscribe();
  }

  // Métodos para detectar cambios
  checkUserModified(): void {
    if (!this.user || !this.originalUser) {
      this.isModified = false;
      return;
    }
    this.isModified =
      this.user.username !== this.originalUser.username ||
      this.user.email !== this.originalUser.email ||
      this.user.phoneNumber !== this.originalUser.phoneNumber ||
      this.user.rol !== this.originalUser.rol ||
      !!this.selectedFile;
  }

  checkProfileModified(): void {
    if (!this.profile || !this.originalProfile) {
      this.isProfileModified = false;
      return;
    }
    this.isProfileModified =
      this.profile.firstName !== this.originalProfile.firstName ||
      this.profile.lastName !== this.originalProfile.lastName ||
      this.profile.identificationType !== this.originalProfile.identificationType ||
      this.profile.identificationNumber !== this.originalProfile.identificationNumber ||
      this.profile.biography !== this.originalProfile.biography ||
      this.profile.direccion !== this.originalProfile.direccion ||
      this.profile.birthDate !== this.originalProfile.birthDate ||
      this.profile.gender !== this.originalProfile.gender ||
      this.profile.campiamigo !== this.originalProfile.campiamigo ||
      !!this.selectedProfileFile;
  }

  loadUser(): void {
    this.adminService.getAllUsers().subscribe({
      next: (data: AdminUser[]) => {
        this.user = data.find(u => u.id === this.userId);
        if (!this.user) {
          this.errorMessage = 'Usuario no encontrado.';
        } else {
          this.originalUser = JSON.parse(JSON.stringify(this.user));
        }
      },
      error: (err) => {
        console.error("Error al obtener usuarios:", err);
        this.errorMessage = 'No se pudo cargar la información del usuario.';
      }
    });
  }

  loadProfile(): void {
    this.profileSubscription = this.adminService.getProfileByUserIdAdmin(this.userId).subscribe({
      next: (profileData: Profile) => {
        this.profile = profileData;
        this.originalProfile = JSON.parse(JSON.stringify(profileData));
      },
      error: (err) => {
        console.error("Error al cargar perfil:", err);
        if (err.status === 404) {
          this.profile = {
            userId: this.userId,
            firstName: '',
            lastName: '',
            identificationType: '',
            identificationNumber: '',
            biography: '',
            direccion: '',
            gender: 'Prefiero no declarar',
            profilePicture: '',
            campiamigo: false
          };
          this.originalProfile = JSON.parse(JSON.stringify(this.profile));
        }
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
      this.checkUserModified();
    }
  }

  buildUserFormData(): FormData {
    const formData = new FormData();
    if (this.user) {
      formData.append('username', this.user.username);
      formData.append('email', this.user.email);
      formData.append('rol', this.user.rol);
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
        this.toastr.success('Cuenta actualizada exitosamente', 'Éxito');
        this.isModified = false;
        this.selectedFile = null;
        this.loadUser();
        this.userDetails.nativeElement.removeAttribute('open');
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

  onProfileFileSelected(event: Event): void {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
      this.selectedProfileFile = target.files[0];
      this.checkProfileModified();
    }
  }

  buildProfileJSON(): Profile {
    if (!this.profile) {
      throw new Error('No hay datos de perfil');
    }
    return {
      userId: this.userId,
      firstName: this.profile.firstName,
      lastName: this.profile.lastName,
      identificationType: this.profile.identificationType,
      identificationNumber: this.profile.identificationNumber,
      biography: this.profile.biography,
      direccion: this.profile.direccion,
      birthDate: this.profile.birthDate,
      gender: this.profile.gender,
      profilePicture: this.profile.profilePicture,
      campiamigo: this.profile.campiamigo
    };
  }

  updateProfileData(): void {
    if (!this.profile) return;
    if (!this.isProfileModified) {
      this.toastr.info('No se han realizado cambios en el perfil', 'Información');
      return;
    }
    const profileJSON = this.buildProfileJSON(); 
    this.adminService.updateProfile(this.userId, profileJSON).subscribe({
      next: () => {
        this.toastr.success('Perfil actualizado exitosamente', 'Éxito');
        this.isProfileModified = false;
        this.loadProfile();
        this.profileDetails.nativeElement.removeAttribute('open');
      },
      error: (err) => {
        this.toastr.error(err.error.msg || 'Error al actualizar el perfil', 'Error');
      }
    });
  }
  

  getProfileImageUrl(profilePicture: string): string {
    if (!profilePicture) {
      return '../../../../../../assets/img/default-user.png';
    }
    return `${environment.endpoint}uploads/profile/${profilePicture}`;
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
