import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { BotInfoService } from '../../../client/middleware/botInfoCliente';
import { Profile } from '../../interfaces/profileInterfaces';
import { ProfileService } from '../../services/profileServices';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-view-profile',
  imports: [CommonModule, FormsModule],
  templateUrl: './view-profile.component.html', 
  styleUrls: ['./view-profile.component.css']
})
export class ViewProfileComponent {
  previewUrl: string | ArrayBuffer | null = null;
  isModified: boolean = false;

  private infoperfilList: string[] = [
    "Estás viendo tu perfil"
  ];

  profileData: Profile = {
    userId: 0,
    firstName: '',
    lastName: '',
    identificationType: '',
    identificationNumber: '',
    biography: '',
    direccion: '',
    birthDate: '',
    gender: 'Prefiero no declarar',
    profilePicture: '',
    status: 'pendiente',
    campiamigo: false
  };

  selectedFile: File | null = null;
  identificationTypes = ['Cédula', 'Tarjeta de Identidad', 'DNI', 'Pasaporte', 'Licencia de Conducir', 'Otro'];
  genders = ['Mujer', 'Hombre', 'Otro género', 'Prefiero no declarar'];

  constructor(
    private profileService: ProfileService,
    private router: Router,
    private toastr: ToastrService,
    private botInfoService: BotInfoService
  ) {}

  ngOnInit(): void {
    this.botInfoService.setInfoList(this.infoperfilList);
    this.getProfileData();
  }

  getProfileData(): void {
    this.profileService.getProfile().subscribe({
      next: (profile) => {
        this.profileData = { ...profile };
      },
      error: (err) => {
        this.toastr.error(err.error.msg || 'Error al obtener el perfil', 'Error');
      }
    });
  }

  setModified(): void {
    this.isModified = true;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.selectedFile = file;
      this.isModified = true;
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        this.previewUrl = e.target?.result ?? null;
      };
      reader.readAsDataURL(file);
    }
  }

  getImageUrl(profilePicture?: string): string {
    if (!profilePicture) {
      return '../../../../../../assets/img/default-denuncia.png';
    }
    return `${environment.endpoint}uploads/client/profile/${profilePicture}`;
  }

  private isIdentificationNumberValid(): boolean {
    const regex = /^\d+$/;
    if (!regex.test(this.profileData.identificationNumber)) {
      this.toastr.error('El número de identificación debe contener solo números', 'Error');
      return false;
    }
    if (this.profileData.identificationNumber.length <= 7) {
      this.toastr.error('El número de identificación debe tener más de 8 dígitos', 'Error');
      return false;
    }
    return true;
  }

  private isBirthDateValid(): boolean {
    const birthDate = new Date(this.profileData.birthDate!);
    if (isNaN(birthDate.getTime())) {
      this.toastr.error('La fecha de nacimiento no es válida', 'Error');
      return false;
    }
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    if (age < 18) {
      this.toastr.error('Debes tener al menos 18 años', 'Error');
      return false;
    }
    if (age > 80) {
      this.toastr.error('La edad no puede ser mayor a 80 años', 'Error');
      return false;
    }
    return true;
  }

  private areFieldsValid(): boolean {
    if (
      !this.profileData.firstName ||
      !this.profileData.lastName ||
      !this.profileData.identificationNumber ||
      !this.profileData.identificationType ||
      !this.profileData.birthDate ||
      !this.profileData.gender
    ) {
      this.toastr.error('Todos los campos son obligatorios', 'Error');
      return false;
    }
    if (!this.isIdentificationNumberValid()) {
      return false;
    }
    if (!this.isBirthDateValid()) {
      return false;
    }
    return true;
  }

  private buildProfileFormData(): FormData {
    const formData = new FormData();
    formData.append('firstName', this.profileData.firstName);
    formData.append('lastName', this.profileData.lastName);
    formData.append('identificationNumber', this.profileData.identificationNumber);
    formData.append('identificationType', this.profileData.identificationType);
    formData.append('biography', this.profileData.biography || '');
    formData.append('direccion', this.profileData.direccion || '');
    formData.append('birthDate', this.profileData.birthDate || '');
    formData.append('gender', this.profileData.gender);
    if (this.selectedFile) {
      formData.append('profilePicture', this.selectedFile);
    }
    return formData;
  }

  updateProfile(): void {
    if (!this.isModified) {
      this.toastr.info('No se han realizado cambios para actualizar', 'Información');
      return;
    }

    if (!this.areFieldsValid()) {
      return;
    }

    const formData = this.buildProfileFormData();

    this.profileService.updateProfile(formData).subscribe({
      next: (res) => {
        this.toastr.success('Perfil actualizado exitosamente', 'Éxito');
        
        // Redireccionamos según el rol guardado en localStorage
        const userRole = localStorage.getItem('rol');
        switch(userRole) {
          case 'campesino':
            this.router.navigate(['/campesino/dashboard']);
            break;
          case 'constructoracivil':
            this.router.navigate(['/constructoracivil']);
            break;
          case 'admin':
            this.router.navigate(['/admin/dashboard']);
            break;
          case 'client':
            this.router.navigate(['/client/dashboard']);
            break;
          default:
            this.router.navigate(['/']);
            break;
        }
      },
      error: (err) => {
        this.toastr.error(err.error.msg || 'Error al actualizar el perfil', 'Error');
      }
    });
  }
}
