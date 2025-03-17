import { Component, OnInit } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { AdminUser, AdminService } from '../../services/adminService';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-users',
  imports: [RouterModule, CommonModule, FormsModule],
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {
  allUsers: AdminUser[] = [];
  users: AdminUser[] = [];
  showFilterModal: boolean = false;

  // Variables para los filtros
  filterId: string = '';
  filterUsername: string = '';
  filterEmail: string = '';
  filterRol: string = '';

  constructor(private adminService: AdminService, private toastr: ToastrService) { }

  ngOnInit(): void {
    this.adminService.getAllUsers().subscribe({
      next: (data) => {
        this.allUsers = data;
        this.users = data;
      },
      error: (err) => {
        console.error('Error al obtener usuarios:', err);
      }
    });
  }

  getImageUrl(profilePicture: string): string {
    if (!profilePicture) {
      return '../../../../../../assets/img/default-user.png';
    }
    return `${environment.endpoint}uploads/client/profile/${profilePicture}`;
  }

  // Abre el modal de filtrado
  openFilterModal(): void {
    this.showFilterModal = true;
  }

  // Cierra el modal de filtrado
  closeFilterModal(): void {
    this.showFilterModal = false;
  }

  // Devuelve true si se ingresó al menos un criterio de filtro
  isFilterValid(): boolean {
    return (
      this.filterId.trim() !== '' ||
      this.filterUsername.trim() !== '' ||
      this.filterEmail.trim() !== '' ||
      this.filterRol.trim() !== ''
    );
  }

  // Aplica el filtrado y cierra el modal
  applyFilter(): void {
    if (!this.isFilterValid()) {
      this.toastr.error('Debe ingresar al menos un criterio de búsqueda', 'Error');
      return;
    }
  
    const filteredUsers = this.allUsers.filter(user => {
      const matchId = this.filterId ? user.id.toString() === this.filterId.trim() : true;
      const matchUsername = this.filterUsername 
        ? user.username.toLowerCase().includes(this.filterUsername.trim().toLowerCase()) 
        : true;
      const matchEmail = this.filterEmail 
        ? user.email.toLowerCase().includes(this.filterEmail.trim().toLowerCase()) 
        : true;
      
      let matchRol = true;
      if (this.filterRol && this.filterRol.trim().toLowerCase() !== 'todos') {
        matchRol = user.rol.toLowerCase().includes(this.filterRol.trim().toLowerCase());
      }
      return matchId && matchUsername && matchEmail && matchRol;
    });
  
    if (filteredUsers.length === 0) {
      this.toastr.error('No se encontraron resultados con los criterios ingresados', 'Error');
      // Si no se encontraron resultados, se mantiene la lista original de usuarios
      this.users = this.allUsers;
    } else {
      this.users = filteredUsers;
    }
  
    this.closeFilterModal();
  }
  

  // Método para determinar la clase CSS según el status
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
