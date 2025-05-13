import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DenunciasService } from '../../../denuncias/middleware/services/denuncias.service';
import { ToastrService } from 'ngx-toastr';
import { TipoDenunciaInterface } from '../../middleware/interfaces/tipoDenunciaInterface';
import { SubtipoDenunciaInterface } from '../../middleware/interfaces/subtipoDenunciaInterface';
import { DenunciaAnonimaInterface } from '../../../admin/middleware/interfaces/denunciasAnonimasInterface';
import { environment } from '../../../../../environments/environment';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-denuncias',
  standalone: true,
  imports: [RouterModule, CommonModule, FormsModule],
  templateUrl: './denuncias.component.html',
  styleUrls: ['./denuncias.component.css']
})
export class DenunciasComponent implements OnInit {
  // Variables para creación de Tipo y Subtipo
  nombre: string = '';
  descripcion: string = '';
  esAnonimaOficial: string = 'true';
  selectedFile: File | null = null;
  previewUrl: string | null = null;

  subtipoNombre: string = '';
  subtipoDescripcion: string = '';
  tipoDenunciaId: number | null = null;
  selectedFileSubtipo: File | null = null;
  previewUrlSubtipo: string | null = null;

  isLoading: boolean = false;

  // Variables para tabla de Tipos de Denuncia
  tiposDenuncias: TipoDenunciaInterface[] = [];
  currentPage: number = 1;
  itemsPerPage: number = 5;
  totalPages: number = 1;
  // Variables de filtrado para Tipos
  showFilterModal: boolean = false;
  filterNombre: string = '';
  filterDescripcion: string = '';
  filterTipo: string = ''; // Filtra según esAnonimaOficial
  private allTipos: TipoDenunciaInterface[] = [];

  // Variables para tabla de Subtipos de Denuncia
  subtiposDenuncias: SubtipoDenunciaInterface[] = [];
  currentPageSub: number = 1;
  itemsPerPageSub: number = 5;
  totalPagesSub: number = 1;
  // Variables de filtrado para Subtipos
  showFilterModalSub: boolean = false;
  filterSubNombre: string = '';
  filterSubDescripcion: string = '';
  filterSubTipoDenunciaId: string = ''; // Filtra por el ID del tipo de denuncia
  private allSubtipos: SubtipoDenunciaInterface[] = [];

  // Variables para Denuncias (anónimas y oficiales)
  denuncias: DenunciaAnonimaInterface[] = [];
  allDenuncias: DenunciaAnonimaInterface[] = [];
  currentPageDenuncias: number = 1;
  itemsPerPageDenuncias: number = 5;
  totalPagesDenuncias: number = 1;
  // Variables de filtrado para Denuncias
  showFilterModalDenuncias: boolean = false;
  filterDenunciaTipo: string = '';  // Se espera "anónima", "oficial" o "todas"
  filterClaveUnica: string = '';

  constructor(
    private denunciasService: DenunciasService,
    private toastr: ToastrService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadTiposDenuncias();
    this.loadSubtiposDenuncias();
    this.loadDenuncias();
  }

  // Métodos para Tipos de Denuncia
  loadTiposDenuncias(): void {
    this.denunciasService.getTiposDenuncia().subscribe({
      next: (data: TipoDenunciaInterface[]) => {
        this.allTipos = data;
        this.tiposDenuncias = data;
        this.totalPages = Math.ceil(this.tiposDenuncias.length / this.itemsPerPage);
      },
      error: (err) => {
        console.error('Error al obtener tipos de denuncia:', err);
        this.toastr.error('Error al cargar los tipos de denuncia', 'Error');
      }
    });
  }

  get paginatedTipos(): TipoDenunciaInterface[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.tiposDenuncias.slice(start, end);
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

  // Métodos para Subtipos de Denuncia
  loadSubtiposDenuncias(): void {
    this.denunciasService.getSubtiposDenuncia().subscribe({
      next: (data: SubtipoDenunciaInterface[]) => {
        this.allSubtipos = data;
        this.subtiposDenuncias = data;
        this.totalPagesSub = Math.ceil(this.subtiposDenuncias.length / this.itemsPerPageSub);
      },
      error: (err) => {
        console.error('Error al obtener subtipos de denuncia:', err);
        this.toastr.error('Error al cargar los subtipos de denuncia', 'Error');
      }
    });
  }

  get paginatedSubtipos(): SubtipoDenunciaInterface[] {
    const start = (this.currentPageSub - 1) * this.itemsPerPageSub;
    const end = start + this.itemsPerPageSub;
    return this.subtiposDenuncias.slice(start, end);
  }

  nextPageSub(): void {
    if (this.currentPageSub < this.totalPagesSub) {
      this.currentPageSub++;
    }
  }
  prevPageSub(): void {
    if (this.currentPageSub > 1) {
      this.currentPageSub--;
    }
  }

  // Métodos para imágenes
  onFileSelected(event: any): void {
    if (event.target.files && event.target.files.length > 0) {
      this.selectedFile = event.target.files[0];
      const reader = new FileReader();
      reader.onload = (e: any) => { this.previewUrl = e.target.result; };
      reader.readAsDataURL(this.selectedFile as File);
    }
  }
  getImageUrl(selectedFile?: string): string {
    if (!selectedFile) {
      return '../../../../../assets/img/default-user.png';
    }
    return `${environment.endpoint}uploads/tipoDenuncias/tipo/${selectedFile}`;
  }
  
  onFileSelectedSubtipo(event: any): void {
    if (event.target.files && event.target.files.length > 0) {
      this.selectedFileSubtipo = event.target.files[0];
      const reader = new FileReader();
      reader.onload = (e: any) => { this.previewUrlSubtipo = e.target.result; };
      reader.readAsDataURL(this.selectedFileSubtipo as File);
    }
  }
  getImageUrlSubtipo(selectedFile?: string): string {
    if (!selectedFile) {
      return '../../../../../assets/img/default-user.png';
    }
    return `${environment.endpoint}uploads/subtipoDenuncias/subtipo/${selectedFile}`;
  }

  // Creación de Tipo de Denuncia
  createTipo(): void {
    if (!this.nombre || !this.descripcion || !this.esAnonimaOficial) {
      this.toastr.warning('Complete todos los campos requeridos.', 'Advertencia');
      return;
    }
    const formData = new FormData();
    formData.append('nombre', this.nombre);
    formData.append('descripcion', this.descripcion);
    formData.append('esAnonimaOficial', this.esAnonimaOficial);
    formData.append('tipo', 'tipo');
    if (this.selectedFile) {
      formData.append('flagImage', this.selectedFile);
    }
    this.isLoading = true;
    this.denunciasService.createTipoDenuncia(formData).subscribe({
      next: (res: TipoDenunciaInterface) => {
        this.toastr.success('Tipo de denuncia creado con éxito.', 'Éxito');
        console.log('Tipo creado:', res);
        // Reinicia el formulario y recarga la lista
        this.nombre = '';
        this.descripcion = '';
        this.esAnonimaOficial = 'true';
        this.selectedFile = null;
        this.previewUrl = null;
        this.isLoading = false;
        this.loadTiposDenuncias();
      },
      error: (err) => {
        console.error('Error al crear el tipo de denuncia:', err);
        this.toastr.error(err.error?.msg || 'Error al crear el tipo de denuncia.', 'Error');
        this.isLoading = false;
      }
    });
  }

  // Creación de Subtipo de Denuncia
  createSubtipo(): void {
    if (!this.subtipoNombre || !this.subtipoDescripcion || !this.tipoDenunciaId) {
      this.toastr.warning('Complete todos los campos requeridos.', 'Advertencia');
      return;
    }
    const formData = new FormData();
    formData.append('nombre', this.subtipoNombre);
    formData.append('descripcion', this.subtipoDescripcion);
    formData.append('tipoDenunciaId', String(this.tipoDenunciaId));
    formData.append('subtipo', 'subtipo');
    if (this.selectedFileSubtipo) {
      formData.append('flagImage', this.selectedFileSubtipo);
    }
    this.isLoading = true;
    this.denunciasService.createSubtipoDenuncia(formData).subscribe({
      next: (res: SubtipoDenunciaInterface) => {
        this.toastr.success('Subtipo de denuncia creado con éxito.', 'Éxito');
        console.log('Subtipo creado:', res);
        // Reinicia el formulario y recarga la lista de subtipos
        this.subtipoNombre = '';
        this.subtipoDescripcion = '';
        this.tipoDenunciaId = null;
        this.selectedFileSubtipo = null;
        this.previewUrlSubtipo = null;
        this.isLoading = false;
        this.loadSubtiposDenuncias();
      },
      error: (err) => {
        console.error('Error al crear el subtipo de denuncia:', err);
        this.toastr.error(err.error?.msg || 'Error al crear el subtipo de denuncia.', 'Error');
        this.isLoading = false;
      }
    });
  }

  // Métodos de filtrado para Tipos
  openFilterModal(): void { this.showFilterModal = true; }
  closeFilterModal(): void { this.showFilterModal = false; }
  isFilterValid(): boolean { return true; }
  applyFilter(): void {
    if (
      this.filterNombre.trim() === '' &&
      this.filterDescripcion.trim() === '' &&
      (this.filterTipo.trim() === '' || this.filterTipo.trim().toLowerCase() === 'todos')
    ) {
      this.tiposDenuncias = [...this.allTipos];
    } else {
      const filtrados = this.allTipos.filter(tipo => {
        const matchNombre = this.filterNombre
          ? tipo.nombre.toLowerCase().includes(this.filterNombre.trim().toLowerCase())
          : true;
        const matchDescripcion = this.filterDescripcion
          ? tipo.descripcion.toLowerCase().includes(this.filterDescripcion.trim().toLowerCase())
          : true;
        const matchTipo =
          (this.filterTipo.trim() === '' || this.filterTipo.trim().toLowerCase() === 'todos')
            ? true
            : tipo.esAnonimaOficial.toString().toLowerCase() === this.filterTipo.trim().toLowerCase();
        return matchNombre && matchDescripcion && matchTipo;
      });

      if (filtrados.length === 0) {
        this.toastr.error('No se encontraron resultados para los filtros aplicados.', 'Error');
        // Se restablece la lista completa
        this.tiposDenuncias = [...this.allTipos];
      } else {
        this.tiposDenuncias = filtrados;
      }
    }
    this.currentPage = 1;
    this.totalPages = Math.ceil(this.tiposDenuncias.length / this.itemsPerPage);
    this.closeFilterModal();
  }

  // Métodos de filtrado para Subtipos
  openFilterModalSub(): void { this.showFilterModalSub = true; }
  closeFilterModalSub(): void { this.showFilterModalSub = false; }
  isFilterValidSub(): boolean { return true; }
  applyFilterSubtipos(): void {
    if (
      this.filterSubNombre.trim() === '' &&
      this.filterSubDescripcion.trim() === '' &&
      (this.filterSubTipoDenunciaId.trim() === '' || this.filterSubTipoDenunciaId.trim().toLowerCase() === 'todos')
    ) {
      this.subtiposDenuncias = [...this.allSubtipos];
    } else {
      const filtrados = this.allSubtipos.filter(subtipo => {
        const matchNombre = this.filterSubNombre
          ? subtipo.nombre.toLowerCase().includes(this.filterSubNombre.trim().toLowerCase())
          : true;
        const matchDescripcion = this.filterSubDescripcion
          ? subtipo.descripcion.toLowerCase().includes(this.filterSubDescripcion.trim().toLowerCase())
          : true;
        const matchTipoDenuncia =
          (this.filterSubTipoDenunciaId.trim() === '' || this.filterSubTipoDenunciaId.trim().toLowerCase() === 'todos')
            ? true
            : subtipo.tipoDenunciaId.toString() === this.filterSubTipoDenunciaId.trim();
        return matchNombre && matchDescripcion && matchTipoDenuncia;
      });

      if (filtrados.length === 0) {
        this.toastr.error('No se encontraron resultados para los filtros aplicados.', 'Error');
        // Se restablece la lista completa
        this.subtiposDenuncias = [...this.allSubtipos];
      } else {
        this.subtiposDenuncias = filtrados;
      }
    }
    this.currentPageSub = 1;
    this.totalPagesSub = Math.ceil(this.subtiposDenuncias.length / this.itemsPerPageSub);
    this.closeFilterModalSub();
  }

  // Métodos para Denuncias (anónimas y oficiales)
  loadDenuncias(): void {
    this.denunciasService.getTodasDenunciasAnonimas().subscribe({
      next: (response) => {
        // Se espera que la respuesta tenga la propiedad "denuncias"
        this.allDenuncias = response.denuncias;
        this.denuncias = [...this.allDenuncias];
        this.totalPagesDenuncias = Math.ceil(this.denuncias.length / this.itemsPerPageDenuncias);
      },
      error: (err) => {
        console.error('Error al cargar las denuncias:', err);
        this.toastr.error('Error al cargar las denuncias', 'Error');
      }
    });
  }

  get paginatedDenuncias(): DenunciaAnonimaInterface[] {
    const start = (this.currentPageDenuncias - 1) * this.itemsPerPageDenuncias;
    const end = start + this.itemsPerPageDenuncias;
    return this.denuncias.slice(start, end);
  }

  nextPageDenuncias(): void {
    if (this.currentPageDenuncias < this.totalPagesDenuncias) {
      this.currentPageDenuncias++;
    }
  }

  prevPageDenuncias(): void {
    if (this.currentPageDenuncias > 1) {
      this.currentPageDenuncias--;
    }
  }

  // Abre y cierra modal de filtro para Denuncias
  openFilterModalDenuncias(): void { this.showFilterModalDenuncias = true; }
  closeFilterModalDenuncias(): void { this.showFilterModalDenuncias = false; }

  // Filtra denuncias por tipo y por clave única
  applyFilterDenuncias(): void {
    let filtered = this.allDenuncias.filter(denuncia => {
      let matchTipo = true;
      if (this.filterDenunciaTipo.trim() !== '' && this.filterDenunciaTipo.trim().toLowerCase() !== 'todas') {
        const tipo = denuncia.tipoDenuncia?.nombre || denuncia.nombreTipo || '';
        matchTipo = tipo.toLowerCase() === this.filterDenunciasTipoNormalized();
      }
      let matchClave = true;
      if (this.filterClaveUnica.trim() !== '') {
        matchClave = denuncia.claveUnica.toLowerCase().includes(this.filterClaveUnica.trim().toLowerCase());
      }
      return matchTipo && matchClave;
    });

    // Si se filtra por clave única y no se encuentra coincidencia, muestra el error y se restablece la lista completa
    if (this.filterClaveUnica.trim() !== '' && filtered.length === 0) {
      this.toastr.error('La clave única no existe.', 'Error');
      filtered = [...this.allDenuncias];
    }

    this.denuncias = filtered;
    this.currentPageDenuncias = 1;
    this.totalPagesDenuncias = Math.ceil(this.denuncias.length / this.itemsPerPageDenuncias);
    this.closeFilterModalDenuncias();
  }

  // Función auxiliar para normalizar el filtro de tipo de denuncia
  private filterDenunciasTipoNormalized(): string {
    return this.filterDenunciaTipo.trim().toLowerCase();
  }

  // Reinicia filtros para Denuncias
  resetFilterDenuncias(): void {
    this.filterDenunciaTipo = '';
    this.filterClaveUnica = '';
    this.denuncias = [...this.allDenuncias];
    this.currentPageDenuncias = 1;
    this.totalPagesDenuncias = Math.ceil(this.denuncias.length / this.itemsPerPageDenuncias);
  }

  // Métodos para descarga de PDF (Tipos y Subtipos)
  downloadPdf(): void {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Listado de Tipos de Denuncias', 14, 22);

    const columns = [
      { header: 'Id', dataKey: 'id' },
      { header: 'Nombre', dataKey: 'nombre' },
      { header: 'Descripción', dataKey: 'descripcion' },
      { header: 'Tipo', dataKey: 'esAnonimaOficial' }
    ];

    const data = this.tiposDenuncias.map(tipo => ({
      id: tipo.id,
      nombre: tipo.nombre,
      descripcion: tipo.descripcion,
      esAnonimaOficial: tipo.esAnonimaOficial
    }));

    autoTable(doc, {
      startY: 30,
      head: [columns.map(col => col.header)],
      body: data.map(row => columns.map(col => (row as any)[col.dataKey])),
      theme: 'grid',
      headStyles: { fillColor: [22, 160, 133] },
      styles: { fontSize: 10 }
    });

    doc.save('tipos_denuncias.pdf');
  }

  downloadPdfSubtipos(): void {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Listado de Subtipos de Denuncias', 14, 22);

    const columns = [
      { header: 'Id', dataKey: 'id' },
      { header: 'Nombre', dataKey: 'nombre' },
      { header: 'Descripción', dataKey: 'descripcion' },
      { header: 'Tipo de Denuncia', dataKey: 'tipoDenunciaId' },
      { header: 'Flag Image', dataKey: 'flagImage' }
    ];

    const data = this.subtiposDenuncias.map(subtipo => ({
      id: subtipo.id,
      nombre: subtipo.nombre,
      descripcion: subtipo.descripcion,
      tipoDenunciaId: subtipo.tipoDenunciaId,
      flagImage: subtipo.flagImage
    }));

    autoTable(doc, {
      startY: 30,
      head: [columns.map(col => col.header)],
      body: data.map(row => columns.map(col => (row as any)[col.dataKey])),
      theme: 'grid',
      headStyles: { fillColor: [22, 160, 133] },
      styles: { fontSize: 10 }
    });

    doc.save('subtipos_denuncias.pdf');
  }

  // Método para volver al dashboard
  goBack(): void {
    this.router.navigate(['/admin/dashboard']);
  }
  
  // Método para redirigir a la vista de detalle de la denuncia enviando la clave única
  verDenuncia(claveUnica: string): void {
    // Aquí se navega a la ruta de detalle, pasando la clave única como parámetro
    this.router.navigate(['/admin/denuncias/detalle', claveUnica]);
  }
}
