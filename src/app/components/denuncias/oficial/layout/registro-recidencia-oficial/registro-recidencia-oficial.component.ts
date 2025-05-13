import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { BotInfoService } from '../../../../admin/layout/utils/botInfoCliente';
import { DenunciaOficialStorageService } from '../../../middleware/services/denuncia-oficial-storage.service';
import { NavbarComponent } from '../../../anonimas/layout/navbar/navbar.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-registro-recidencia-oficial',
  imports: [NavbarComponent,CommonModule,ReactiveFormsModule],
  templateUrl: './registro-recidencia-oficial.component.html',
  styleUrl: './registro-recidencia-oficial.component.css'
})
export class RegistroRecidenciaOficialComponent implements OnInit { // Nombre de clase debe coincidir con el importado en rutas
  incidenteForm: FormGroup;
  modo: 'oficial' = 'oficial';
  queryParams: any = {};

  zonasIncidente = [
    { valor: 'Urbana', etiqueta: 'Zona Urbana' }, // Asegúrate que 'Urbana' coincida con tu ZonaIncidenteEnum del backend
    { valor: 'Rural', etiqueta: 'Zona Rural' }   // Asegúrate que 'Rural' coincida
  ];

  currentStep = 4; // Ajusta este número según el orden en tu flujo
  totalSteps = 5;  // Total de pasos incluyendo el nuevo resumen oficial

  private infoResidenciaIncidente: string[] = [
    "Proporciona los detalles sobre el lugar y momento del incidente.",
    "Selecciona si ocurrió en zona urbana o rural.",
    "Indica la fecha y hora aproximada de los hechos."
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private denunciaOficialStorage: DenunciaOficialStorageService,
    private toastr: ToastrService,
    private botInfoService: BotInfoService
  ) {
    this.incidenteForm = this.fb.group({
      zonaIncidente: ['', Validators.required],
      ciudadIncidente: [''],
      barrioIncidente: [''],
      municipioIncidente: [''],
      veredaIncidente: [''],
      fechaIncidente: ['', Validators.required],
      horaIncidente: ['', [Validators.required, Validators.pattern(/^([01]\d|2[0-3]):([0-5]\d)$/)]], // HH:MM
      ocurrioViaPublica: [false, Validators.required] // Default a false
    });

    this.incidenteForm.get('zonaIncidente')?.valueChanges.subscribe(zona => {
      this.updateConditionalValidators(zona);
    });
  }

  ngOnInit(): void {
    this.route.queryParamMap.subscribe(params => {
      const tipoRuta = params.get('tipo');
      if (tipoRuta !== 'oficial') {
        this.toastr.error("Flujo incorrecto para registro de datos del incidente.", "Error de Ruta");
        this.router.navigate(['/body/oficial']);
        return;
      }
      const queryParamsTemp: any = {};
      params.keys.forEach(key => {
        queryParamsTemp[key] = params.get(key);
      });
      this.queryParams = queryParamsTemp;
      console.log('REGISTRO INCIDENTE - Modo:', this.modo, 'Params:', this.queryParams);
    });

    const datosGuardados = this.denunciaOficialStorage.getDenunciaData();
    if (datosGuardados) {
      this.incidenteForm.patchValue({
        zonaIncidente: datosGuardados.zonaIncidente,
        ciudadIncidente: datosGuardados.ciudadIncidente,
        barrioIncidente: datosGuardados.barrioIncidente,
        municipioIncidente: datosGuardados.municipioIncidente,
        veredaIncidente: datosGuardados.veredaIncidente,
        fechaIncidente: datosGuardados.fechaIncidente,
        horaIncidente: datosGuardados.horaIncidente,
        ocurrioViaPublica: datosGuardados.ocurrioViaPublica || false
      });
      if (datosGuardados.zonaIncidente) {
        this.updateConditionalValidators(datosGuardados.zonaIncidente);
      }
    }
    this.botInfoService.setInfoList(this.infoResidenciaIncidente);
  }

  updateConditionalValidators(zona: string | null) {
    const ciudad = this.incidenteForm.get('ciudadIncidente');
    const barrio = this.incidenteForm.get('barrioIncidente');
    const municipio = this.incidenteForm.get('municipioIncidente');
    const vereda = this.incidenteForm.get('veredaIncidente');

    // Limpiar siempre primero
    ciudad?.clearValidators(); barrio?.clearValidators();
    municipio?.clearValidators(); vereda?.clearValidators();

    if (zona === 'Urbana') { // Usar los valores string exactos de tu ENUM
      ciudad?.setValidators(Validators.required);
      barrio?.setValidators(Validators.required);
    } else if (zona === 'Rural') {
      municipio?.setValidators(Validators.required);
      vereda?.setValidators(Validators.required);
    }

    // Actualizar estado de validez
    ciudad?.updateValueAndValidity(); barrio?.updateValueAndValidity();
    municipio?.updateValueAndValidity(); vereda?.updateValueAndValidity();
  }

  get f() { return this.incidenteForm.controls; }

  handleContinue(): void {
    if (this.incidenteForm.invalid) {
      this.toastr.error('Completa todos los campos requeridos sobre el incidente.', 'Formulario Incompleto');
      this.incidenteForm.markAllAsTouched();
      return;
    }

    const datosIncidenteForm = this.incidenteForm.value;

    // Guardar datos del incidente en DenunciaOficialStorageService
    // (Asegúrate de que estos setters existen en tu servicio)
    this.denunciaOficialStorage.setZonaIncidente(datosIncidenteForm.zonaIncidente);
    this.denunciaOficialStorage.setCiudadIncidente(datosIncidenteForm.ciudadIncidente || undefined);
    this.denunciaOficialStorage.setBarrioIncidente(datosIncidenteForm.barrioIncidente || undefined);
    this.denunciaOficialStorage.setMunicipioIncidente(datosIncidenteForm.municipioIncidente || undefined);
    this.denunciaOficialStorage.setVeredaIncidente(datosIncidenteForm.veredaIncidente || undefined);
    this.denunciaOficialStorage.setFechaIncidente(datosIncidenteForm.fechaIncidente);
    this.denunciaOficialStorage.setHoraIncidente(datosIncidenteForm.horaIncidente);
    this.denunciaOficialStorage.setOcurrioViaPublica(datosIncidenteForm.ocurrioViaPublica);

    console.log('REGISTRO INCIDENTE - Datos guardados en storage:', datosIncidenteForm);
    console.log('REGISTRO INCIDENTE - Estado actual del storage:', this.denunciaOficialStorage.getDenunciaData());


    // Navegar al nuevo componente de Resumen Oficial
    this.router.navigate(
      ['/body/resumenOficial'], // RUTA AL NUEVO COMPONENTE DE RESUMEN
      {
        queryParams: this.queryParams, // Pasa todos los queryParams para mantener el contexto
        queryParamsHandling: 'merge'
      }
    );
  }

  goBack(): void {
    // Navega al paso anterior (Registro Denunciante)
    this.router.navigate(['/body/registroOficial'], { queryParams: this.queryParams, queryParamsHandling: 'merge' });
  }
}