import { Component, OnInit, OnDestroy } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { AdminUser, AdminService } from '../../services/admin.service';
import { Router, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Subscription, interval } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Importa jsPDF y autoTable
// Agrega estas importaciones (si aún no existen)
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { BotInfoService } from '../utils/botInfoCliente';

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
  // Controla la vista: 'card' para tarjetas o 'table' para tabla
  viewMode: 'card' | 'table' = 'card';

  // Variables para paginación en la vista tabla
  currentPage: number = 1;
  pageSize: number = 10;
  totalPages: number = 1;

  // Variables de filtrado
  filterId: string = '';
  filterUsername: string = '';
  filterEmail: string = '';
  filterRol: string = '';

  private pollingSubscription!: Subscription;

  constructor(
    private botInfoService: BotInfoService,
    private adminService: AdminService,
    private toastr: ToastrService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadUsers();
    // Configuramos información para el bot (o ayuda en pantalla)
    this.botInfoService.setInfoList(["Estas viendo admin usuarios"]);
    // Realiza polling cada 1 segundo para actualizar la lista (ajusta el intervalo según necesidad)
    this.pollingSubscription = interval(1000).subscribe(() => this.loadUsers());
  } 

  ngOnDestroy(): void {
    if (this.pollingSubscription) {
      this.pollingSubscription.unsubscribe();
    }
  }

  loadUsers(): void {
    this.adminService.getAllUsers().subscribe({
      next: (data: AdminUser[]) => {
        this.allUsers = data;
        // Si hay filtros activos, se aplican con los nuevos datos
        if (this.isFilterValid()) {
          this.applyFilter(true);
        } else {
          this.users = data;
        }
        this.calculatePagination();
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

  // Abre el modal para filtrar
  openFilterModal(): void {
    this.showFilterModal = true;
  }

  // Cierra el modal
  closeFilterModal(): void {
    this.showFilterModal = false;
  }

  // Valida que se haya ingresado al menos un criterio de búsqueda
  isFilterValid(): boolean {
    return (
      this.filterId.trim() !== '' ||
      this.filterUsername.trim() !== '' ||
      this.filterEmail.trim() !== '' ||
      this.filterRol.trim() !== ''
    );
  }

  // Aplica el filtro sobre la lista de usuarios
  applyFilter(isPolling: boolean = false): void {
    if (!this.isFilterValid()) {
      if (!isPolling) {
        this.toastr.error('Debe ingresar al menos un criterio de búsqueda', 'Error');
      }
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
      if (!isPolling) {
        this.toastr.error('No se encontraron resultados con los campos ingresados', 'Error');
      }
      this.users = this.allUsers;
    } else {
      this.users = filteredUsers;
    }

    if (!isPolling) {
      this.closeFilterModal();
    }
    // Reinicia la paginación al aplicar filtro
    this.currentPage = 1;
    this.calculatePagination();
  }

  // Alterna entre vista en tarjetas y vista en tabla
  toggleView(): void {
    this.viewMode = this.viewMode === 'card' ? 'table' : 'card';
    if (this.viewMode === 'table') {
      this.currentPage = 1;
      this.calculatePagination();
    }
  }

  // Retorna la clase CSS correspondiente según el status del usuario
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

  // Calcula el número total de páginas en función de los usuarios filtrados
  calculatePagination(): void {
    const totalItems = this.users.length;
    this.totalPages = Math.ceil(totalItems / this.pageSize);
  }

  // Obtiene los usuarios correspondientes a la página actual (para la vista en tabla)
  get paginatedUsers(): AdminUser[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.users.slice(start, start + this.pageSize);
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

 // Método para generar y descargar el PDF
downloadPdf(): void {
  const doc = new jsPDF();

  // Título del PDF
  doc.setFontSize(18);
  doc.text('Listado de Usuarios', 14, 22);

  // Define las columnas y los datos
  const columns = [
    { header: 'Id', dataKey: 'id' },
    { header: 'Nombre', dataKey: 'username' },
    { header: 'Email', dataKey: 'email' },
    { header: 'Rol', dataKey: 'rol' },
    { header: 'Status', dataKey: 'status' }
  ];

  // Puedes usar la lista completa o la paginada, según prefieras:
  const data = this.users.map(user => ({
    id: user.id,
    username: user.username,
    email: user.email,
    rol: user.rol,
    status: user.status
  }));

  // Configuración de autoTable

  autoTable(doc, {
    startY: 30,
    head: [columns.map(col => col.header)],
    body: data.map(row => columns.map(col => (row as any)[col.dataKey])),
    theme: 'grid',
    headStyles: { fillColor: [22, 160, 133] },
    styles: { fontSize: 10 }
  });
  

  // Descargar el PDF
  doc.save('usuarios.pdf');
}

}
