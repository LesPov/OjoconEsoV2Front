// src/app/admin/components/user-summary/user-summary.component.ts
import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
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
import { SocioDemographicData } from '../../../middleware/interfaces/socioDemographic.interface';

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
  socioData!: SocioDemographicData | null; // Información sociodemográfica

  // Para actualizar la imagen del usuario
  selectedFile: File | null = null;
  // Para actualizar la imagen del perfil (opcional)
  selectedProfileFile: File | null = null;

  // Banderas para detectar cambios
  isModified: boolean = false;
  isProfileModified: boolean = false;
  isSocioModified: boolean = false; // Para cambios en la sociodemográfica

  // Opciones de rol
  roles: string[] = ['client', 'admin', 'campesino', 'constructoracivil'];

  statusSubscription!: Subscription;
  pollingSubscription!: Subscription;
  profileSubscription!: Subscription;
  socioDataSubscription!: Subscription; // Suscripción para sociodemográfica

  // Referencias a elementos <details>
  @ViewChild('userDetails') userDetails!: ElementRef;
  @ViewChild('profileDetails') profileDetails!: ElementRef;
  @ViewChild('socioDetails') socioDetails!: ElementRef; // Para la sección sociodemográfica

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
    // loadSocioData() se invoca en loadUser() si el usuario es campesino

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
    this.socioDataSubscription?.unsubscribe();
  }

  // Método para cargar la información sociodemográfica (solo si el usuario es campesino)
  loadSocioData(): void {
    this.socioDataSubscription = this.adminService.getSociodemographicData(this.userId).subscribe({
      next: (data: SocioDemographicData) => {
        this.socioData = data;
        this.isSocioModified = false;
      },
      error: (err) => {
        console.error("Error al cargar la información sociodemográfica:", err);
        if (err.status === 404) {
          this.socioData = null;
        }
      }
    });
  }

  // Detección de cambios en la sección sociodemográfica
  checkSocioModified(): void {
    // Aquí podrías comparar con un objeto original si lo guardas; por ahora, se marca como modificado
    this.isSocioModified = true;
  }

  // Construye FormData con la información sociodemográfica
  buildSocioFormData(): FormData {
    const formData = new FormData();
    if (this.socioData) {
      formData.append('residenceYears', String(this.socioData.residenceYears));
      formData.append('residenceMonths', String(this.socioData.residenceMonths));
      formData.append('selfIdentification', this.socioData.selfIdentification);
      if (this.socioData.otherIdentification) {
        formData.append('otherIdentification', this.socioData.otherIdentification);
      }
      formData.append('ethnicGroup', this.socioData.ethnicGroup);
      if (this.socioData.ethnicGroupDetail) {
        formData.append('ethnicGroupDetail', this.socioData.ethnicGroupDetail);
      }
      formData.append('hasDisability', String(this.socioData.hasDisability));
      if (this.socioData.disabilityDetail) {
        formData.append('disabilityDetail', this.socioData.disabilityDetail);
      }
      formData.append('conflictVictim', String(this.socioData.conflictVictim));
      formData.append('educationLevel', this.socioData.educationLevel);
    }
    return formData;
  }

  // Método para actualizar la información sociodemográfica
  updateSocioData(): void {
    if (!this.isSocioModified) {
      this.toastr.info('No se han realizado cambios en la información sociodemográfica', 'Información');
      return;
    }
    if (!this.user || !this.socioData) return; // Verificamos que socioData no sea null
    
    this.adminService.updateSociodemographicData(this.user.id, this.socioData).subscribe({
      next: (updatedData) => {
        this.toastr.success('Información sociodemográfica actualizada exitosamente', 'Éxito');
        this.isSocioModified = false;
        this.loadSocioData();
        this.socioDetails.nativeElement.removeAttribute('open');
      },
      error: (err) => {
        this.toastr.error(err.error.msg || 'Error al actualizar la información sociodemográfica', 'Error');
      }
    });
  }
  

  // Métodos para usuario y perfil (ya existentes)...
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
          if (this.user.rol?.toLowerCase() === 'campesino') {
            this.loadSocioData();
          } else {
            this.socioData = null;
          }
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
        this.toastr.success('Perfil actualizado exitosamente', 'Éxito');
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

  buildProfileFormData(): FormData {
    const formData = new FormData();
    if (this.profile) {
      formData.append('firstName', this.profile.firstName);
      formData.append('lastName', this.profile.lastName);
      formData.append('identificationType', this.profile.identificationType);
      formData.append('identificationNumber', this.profile.identificationNumber);
      formData.append('biography', this.profile.biography);
      formData.append('direccion', this.profile.direccion);
      if (this.profile.birthDate) {
        formData.append('birthDate', this.profile.birthDate);
      }
      formData.append('gender', this.profile.gender);
      formData.append('campiamigo', this.profile.campiamigo ? 'true' : 'false');
      if (this.selectedProfileFile) {
        formData.append('profilePicture', this.selectedProfileFile);
      }
    }
    return formData;
  }

  updateProfileData(): void {
    if (!this.profile) return;
    const formData = this.buildProfileFormData();
    this.profileService.updateProfile(formData).subscribe({
      next: () => {
        this.toastr.success('Perfil actualizado exitosamente', 'Éxito');
        this.selectedProfileFile = null;
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
