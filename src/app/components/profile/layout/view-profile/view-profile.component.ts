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
  isModified: boolean = false; // Indica si el formulario ha sido modificado

  private infoperfilList: string[] = [
    "Estás viendo tu perfilllllllllllllll"
  ];

  // Modelo para el perfil
  profileData: Profile = {
    userId: 0,
    firstName: '',
    lastName: '',
    identificationType: '',
    identificationNumber: '',
    biography: '',
    direccion: '',
    birthDate: '',  // Formato YYYY-MM-DD
    gender: 'Prefiero no declarar',
    profilePicture: '',
    status: 'pendiente',
    campiamigo: false
  };

  selectedFile: File | null = null;

  // Opciones para selects
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

  // Consulta el perfil del usuario
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

  // Marca el formulario como modificado
  setModified(): void {
    this.isModified = true;
  }

  // Captura el archivo seleccionado para la imagen y genera vista previa
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

  // Retorna la URL de la imagen o una imagen por defecto
  getImageUrl(profilePicture?: string): string {
    if (!profilePicture) {
      return '../../../../../../assets/img/default-denuncia.png';
    }
    return `${environment.endpoint}uploads/client/profile/${profilePicture}`;
  }

  // Valida que el número de identificación contenga solo dígitos y tenga más de 8 dígitos
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

  // Valida que la fecha de nacimiento indique que el usuario tenga entre 18 y 80 años
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

  // Valida los campos obligatorios del perfil, incluyendo las validaciones adicionales
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

  // Construye el objeto FormData con la información del perfil
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
    // Solo se adjunta la imagen si el usuario seleccionó una nueva
    if (this.selectedFile) {
      formData.append('profilePicture', this.selectedFile);
    }
    return formData;
  }

  // Envía el formulario para actualizar el perfil
  updateProfile(): void {
    // Verifica si hubo cambios en el formulario
    if (!this.isModified) {
      this.toastr.info('No se han realizado cambios para actualizar', 'Información');
      return;
    }

    // Valida los campos obligatorios y las reglas de validación
    if (!this.areFieldsValid()) {
      return;
    }

    // Construye el objeto FormData a partir de los datos del perfil
    const formData = this.buildProfileFormData();

    // Llama al servicio para actualizar el perfil
    this.profileService.updateProfile(formData).subscribe({
      next: (res) => {
        this.toastr.success('Perfil actualizado exitosamente', 'Éxito');
        this.router.navigate(['/client/dashboard']);
      },
      error: (err) => {
        this.toastr.error(err.error.msg || 'Error al actualizar el perfil', 'Error');
      }
    });
  }
}
