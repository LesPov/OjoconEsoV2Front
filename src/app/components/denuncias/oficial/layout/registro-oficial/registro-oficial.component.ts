import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';

import { DenunciaOficialStorageService } from '../../../middleware/services/denuncia-oficial-storage.service';
// NO NECESITAS DenunciasHttpService aquí si solo guardas en storage
import { BotInfoService } from '../../../../admin/layout/utils/botInfoCliente';
import { NavbarComponent } from '../../../anonimas/layout/navbar/navbar.component'; // O un navbar específico para oficiales
// import { TipoIdentificacionEnumFrontend } from '../../../../admin/middleware/interfaces/enums';

@Component({
  selector: 'app-registro-oficial',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NavbarComponent],
  templateUrl: './registro-oficial.component.html',
  styleUrls: ['./registro-oficial.component.css']
})
export class RegistroOficialComponent implements OnInit {
  registroForm: FormGroup;
  modo: 'oficial' = 'oficial'; // Siempre oficial para este componente
  queryParams: any = {};

  tiposIdentificacion = [
    { valor: 'Cédula de Ciudadanía', etiqueta: 'Cédula de Ciudadanía (CC)' },
    { valor: 'Cédula de Extranjería', etiqueta: 'Cédula de Extranjería (CE)' },
    { valor: 'Tarjeta de Identidad', etiqueta: 'Tarjeta de Identidad (TI)' },
    { valor: 'Pasaporte', etiqueta: 'Pasaporte (PAS)' },
    { valor: 'Otro', etiqueta: 'Otro' }
  ];

  currentStep = 3; // Ajusta el número de paso actual en tu flujo
  totalSteps = 5;  // Ajusta el número total de pasos (ej. Tipo, Subtipo, Evidencia, Ubicación, Denunciante, ResidenciaIncidente)

  private infoRegistroDenunciante: string[] = [
    "Estás registrando los datos de la persona que realiza la denuncia.",
    "Por favor, completa la información personal solicitada.",
    "Si estás realizando la denuncia en nombre de otra persona, marca la casilla correspondiente."
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private denunciaOficialStorage: DenunciaOficialStorageService,
    private toastr: ToastrService,
    private botInfoService: BotInfoService
  ) {
    this.registroForm = this.fb.group({
      tipoIdentificacionDenunciante: ['', Validators.required],
      numeroIdentificacionDenunciante: ['', [Validators.required, Validators.pattern('^[a-zA-Z0-9]+$')]], // Permitir alfanuméricos para pasaporte
      nombreDenunciante: ['', Validators.required],
      apellidoDenunciante: ['', Validators.required],
      fechaNacimientoDenunciante: [''],
      denunciaEnNombreDeTercero: [false, Validators.required]
    });
  }

  ngOnInit(): void {
    this.route.queryParamMap.subscribe(params => {
      const tipoRuta = params.get('tipo');
      if (tipoRuta !== 'oficial') {
        this.toastr.error("Flujo incorrecto para registro de datos del denunciante.", "Error de Ruta");
        this.router.navigate(['/body/oficial']); // O al inicio del flujo oficial
        return;
      }
      // Guardar todos los queryParams para pasarlos al siguiente paso
      const queryParamsTemp: any = {};
      params.keys.forEach(key => {
        queryParamsTemp[key] = params.get(key);
      });
      this.queryParams = queryParamsTemp;
      console.log('REGISTRO DENUNCIANTE - Modo:', this.modo, 'Params:', this.queryParams);
    });

    const datosGuardados = this.denunciaOficialStorage.getDenunciaData();
    if (datosGuardados) {
      this.registroForm.patchValue({
        tipoIdentificacionDenunciante: datosGuardados.tipoIdentificacionDenunciante,
        numeroIdentificacionDenunciante: datosGuardados.numeroIdentificacionDenunciante,
        nombreDenunciante: datosGuardados.nombreDenunciante,
        apellidoDenunciante: datosGuardados.apellidoDenunciante,
        fechaNacimientoDenunciante: datosGuardados.fechaNacimientoDenunciante,
        denunciaEnNombreDeTercero: datosGuardados.denunciaEnNombreDeTercero || false
      });
    }
    this.botInfoService.setInfoList(this.infoRegistroDenunciante);
  }

  get f() { return this.registroForm.controls; }

  handleContinue(): void { // Renombrado de onSubmit a handleContinue si el botón del navbar emite (continuar)
    if (this.registroForm.invalid) {
      this.toastr.error('Completa todos los campos requeridos del denunciante.', 'Formulario Incompleto');
      this.registroForm.markAllAsTouched();
      return;
    }

    const datosDenuncianteForm = this.registroForm.value;

    // Guardar solo los datos de este formulario en el DenunciaOficialStorageService
    // El servicio debería tener métodos para actualizar parcialmente el objeto 'denuncia'
    // o puedes obtener el objeto actual, modificarlo y guardarlo de nuevo.
    // Asumiremos que el servicio tiene métodos setter individuales por ahora,
    // o un método para actualizar un subconjunto de campos.
    // Si no, necesitas implementar eso en DenunciaOficialStorageService.

    // Opción A: Si el servicio tiene setters individuales (más limpio)
    this.denunciaOficialStorage.setTipoIdentificacionDenunciante(datosDenuncianteForm.tipoIdentificacionDenunciante);
    this.denunciaOficialStorage.setNumeroIdentificacionDenunciante(datosDenuncianteForm.numeroIdentificacionDenunciante);
    this.denunciaOficialStorage.setNombreDenunciante(datosDenuncianteForm.nombreDenunciante);
    this.denunciaOficialStorage.setApellidoDenunciante(datosDenuncianteForm.apellidoDenunciante);
    if (datosDenuncianteForm.fechaNacimientoDenunciante) {
      this.denunciaOficialStorage.setFechaNacimientoDenunciante(datosDenuncianteForm.fechaNacimientoDenunciante);
    }
    this.denunciaOficialStorage.setDenunciaEnNombreDeTercero(datosDenuncianteForm.denunciaEnNombreDeTercero);

    console.log('REGISTRO DENUNCIANTE - Datos guardados en storage:', datosDenuncianteForm);

    // Navegar al siguiente componente (RegistroResidenciaIncidenteComponent)
    // pasando los queryParams acumulados.
    this.router.navigate(
      ['/body/registroResidenciaIncidente'], // <--- RUTA AL NUEVO COMPONENTE
      {
        queryParams: this.queryParams, // Pasa todos los queryParams para mantener el contexto
        queryParamsHandling: 'merge'   // Conserva queryParams existentes y añade/sobrescribe los nuevos
      }
    );
  }

  goBack(): void {
    // Navega al paso anterior (ej. Ubicacion), manteniendo los queryParams
    this.router.navigate(['/body/ubicacion'], { queryParams: this.queryParams, queryParamsHandling: 'merge' });
  }
}