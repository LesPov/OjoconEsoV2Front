import { Component, OnInit, OnDestroy } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { AdminUser, AdminService } from '../../services/adminService';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Subscription, interval } from 'rxjs';

@Component({
  selector: 'app-users',
  imports: [RouterModule, CommonModule, FormsModule],
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit, OnDestroy {
  allUsers: AdminUser[] = [];
  users: AdminUser[] = [];
  showFilterModal: boolean = false;
  
  // Variables de filtrado 
  filterId: string = '';
  filterUsername: string = '';
  filterEmail: string = '';
  filterRol: string = '';

  private pollingSubscription!: Subscription;

  constructor(private adminService: AdminService, private toastr: ToastrService) { }

  ngOnInit(): void {
    this.loadUsers();
    // Configura polling cada 5 segundos
    this.pollingSubscription = interval(5000).subscribe(() => this.loadUsers());
  }

  ngOnDestroy(): void {
    if (this.pollingSubscription) {
      this.pollingSubscription.unsubscribe();
    }
  }

  loadUsers(): void {
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

  // Métodos para abrir y cerrar el modal de filtrado
  openFilterModal(): void {
    this.showFilterModal = true;
  }
  closeFilterModal(): void {
    this.showFilterModal = false;
  }

  // Verifica si se ingresó al menos un criterio de búsqueda
  isFilterValid(): boolean {
    return (
      this.filterId.trim() !== '' ||
      this.filterUsername.trim() !== '' ||
      this.filterEmail.trim() !== '' ||
      this.filterRol.trim() !== ''
    );
  }

  // Aplica el filtro sobre la lista de usuarios
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
      this.toastr.error('No se encontraron resultados con los campos ingresados', 'Error');
      this.users = this.allUsers;
    } else {
      this.users = filteredUsers;
    }
  
    this.closeFilterModal();
  }

  // Devuelve la clase CSS según el status del usuario
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
