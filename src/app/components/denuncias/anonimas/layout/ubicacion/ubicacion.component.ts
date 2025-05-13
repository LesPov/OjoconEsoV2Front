import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import * as L from 'leaflet';
import { ToastrService } from 'ngx-toastr';
import { BotInfoService } from '../../../../admin/layout/utils/botInfoCliente';
import { DenunciaAnonimaStorageService } from '../../../middleware/services/denunciaStorage.service';
import { NavbarComponent } from '../navbar/navbar.component';
import { DenunciaOficialStorageService } from '../../../middleware/services/denuncia-oficial-storage.service';

@Component({
  selector: 'app-ubicacion',
  imports: [NavbarComponent],
  templateUrl: './ubicacion.component.html',
  styleUrls: ['./ubicacion.component.css']
})
export class UbicacionComponent implements OnInit, AfterViewInit, OnDestroy {
  currentStep = 2;
  totalSteps = 5;
  private map!: L.Map;
  private marker: L.Marker | null = null;
  selectedLocation: { lat: number; lng: number } | null = null;
  // Dirección a mostrar con información detallada
  direccionSeleccionada: string = '';
  isLoading: boolean = false;
  modo: 'anonima' | 'oficial' = 'anonima';
  queryParams: any = {};
  // Lista de mensajes de ayuda
  private infoUbicacion: string[] = [
    "Bienvenido a la sección de selección de ubicación.",
    "Tu dispositivo intentará detectar tu ubicación automáticamente. Si no es posible, selecciona un punto en el mapa.",
    "Haz clic en el mapa para elegir el lugar donde ocurrió el incidente.",
    "Una vez que hayas seleccionado una ubicación, podrás continuar con el siguiente paso."
  ];

  constructor(
    private router: Router,
    private toastr: ToastrService,
    private denunciaAnonimaStorage: DenunciaAnonimaStorageService,
    private denunciaOficialStorage: DenunciaOficialStorageService,
    private botInfoService: BotInfoService,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    // Lee una vez por snapshot…
    const snapshot = this.route.snapshot.queryParamMap;
    this.queryParams = {
      tipo: snapshot.get('tipo') || 'anonima',
      nombreTipoDenuncia: snapshot.get('nombreTipoDenuncia'),
      nombreSubtipoDenuncia: snapshot.get('nombreSubtipoDenuncia')
    };
    this.modo = this.queryParams.tipo === 'oficial' ? 'oficial' : 'anonima';

    // …y suscríbete para reaccionar si cambian luego
    this.route.queryParamMap.subscribe(qp => {
      this.queryParams.tipo = qp.get('tipo') || this.queryParams.tipo;
      // (y así sucesivamente si quieres reaccionar dinámicamente)
    });
  }


  ngAfterViewInit() {
    this.requestUserLocation();
  }

  private requestUserLocation() {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          this.initializeMap(latitude, longitude);
          // Coloca un marcador en la ubicación actual
          this.handleMapClick({ latlng: { lat: latitude, lng: longitude } } as L.LeafletMouseEvent);
        },
        (error) => {
          this.toastr.error('No se pudo obtener la ubicación actual. Usa el mapa para seleccionar una ubicación.');
          this.initializeMap(4.6097, -74.0817); // Bogotá por defecto
        }
      );
    } else {
      this.toastr.error('El dispositivo no soporta geolocalización. Usa el mapa para seleccionar una ubicación.');
      this.initializeMap(4.6097, -74.0817);
    }
  }

  private initializeMap(lat: number, lng: number) {
    this.map = L.map('map', { zoomControl: false }).setView([lat, lng], 13);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '© OpenStreetMap contributors, © CartoDB'
    }).addTo(this.map);

    this.map.on('click', (e: L.LeafletMouseEvent) => {
      this.handleMapClick(e);
    });
  }

  private async handleMapClick(e: L.LeafletMouseEvent) {
    const { lat, lng } = e.latlng;
    if (this.marker) {
      this.map.removeLayer(this.marker);
    }
    this.marker = L.marker([lat, lng]).addTo(this.map);
    this.selectedLocation = { lat, lng };
    await this.obtenerDireccion(lat, lng);
  }

  centrarEnUbicacionActual() {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          this.map.setView([latitude, longitude], 13);
          this.handleMapClick({ latlng: { lat: latitude, lng: longitude } } as L.LeafletMouseEvent);
          this.toastr.success('Dirección actual');
        },
        (error) => {
          this.toastr.error('No se pudo obtener la ubicación actual');
        }
      );
    } else {
      this.toastr.error('El dispositivo no soporta geolocalización');
    }
  }

  private async obtenerDireccion(lat: number, lng: number) {
    this.isLoading = true;
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
      );
      const data = await response.json();

      // Extraer campos de la dirección
      const { road, house_number, pedestrian, neighbourhood, suburb, city, town, village, county, city_district, postcode } = data.address;
      const calle = road || pedestrian || 'Calle desconocida';
      const numero = house_number || '';
      // Puedes asignar "carrera" si encuentras un campo adecuado; aquí lo dejamos vacío.
      const carrera = '';
      // Barrio y localidad
      const barrio = neighbourhood || '';
      const localidad = suburb || '';
      // Ciudad: usar city, town o village
      const ciudad = city || town || village || 'Ciudad desconocida';
      // Municipio o distrito: usar county o city_district
      const municipio = county || city_district || 'Municipio desconocido';
      const cp = postcode || '';

      // Construir la dirección completa
      this.direccionSeleccionada = `${calle} ${numero}${carrera ? ' - ' + carrera : ''}${barrio ? ', ' + barrio : ''}${localidad ? ', ' + localidad : ''}, ${ciudad}, ${municipio} ${cp} (Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)})`;
      this.toastr.success('Ubicación seleccionada correctamente');
    } catch (error) {
      this.toastr.error('Error al obtener la dirección');
      this.direccionSeleccionada = `Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)}`;
    } finally {
      this.isLoading = false;
    }
  }

 // --- MÉTODO handleContinue MODIFICADO ---
  handleContinue(): void {
    if (!this.selectedLocation) {
      this.toastr.error('Por favor, selecciona una ubicación en el mapa');
      return;
    }

    // Asegurarse de que 'modo' tiene un valor válido.
    if (!this.modo) {
        console.error("UBICACION - Error Crítico: Falta 'modo'. No se puede guardar la dirección.");
        this.toastr.error("Error interno al procesar la denuncia.");
        return;
    }

    // 1. Lógica para seleccionar el servicio de storage y guardar la dirección
    if (this.modo === 'oficial') {
      this.denunciaOficialStorage.setDireccion(this.direccionSeleccionada);
      console.log('UBICACION - Dirección guardada en OFICIAL Storage:', this.direccionSeleccionada);
    } else { // Asumir 'anonima' si no es 'oficial'
      this.denunciaAnonimaStorage.setDireccion(this.direccionSeleccionada);
      console.log('UBICACION - Dirección guardada en ANÓNIMA Storage:', this.direccionSeleccionada);
    }

    // 2. Navegación (tu lógica de navegación basada en 'modo' ya es correcta)
    console.log(`UBICACION - Navegando. Modo actual: ${this.modo}`);
    if (this.modo === 'oficial') {
      this.router.navigate(['/body/registroOficial'], { // Ruta absoluta es más clara aquí
        // relativeTo: this.route, // No necesitas relativeTo si usas ruta absoluta
        queryParams: this.queryParams, // Pasa todos los queryParams acumulados
        queryParamsHandling: 'merge' // Conserva cualquier otro queryParam que pudiera existir
      });
    } else {
      this.router.navigate(['/body/resumen'], { // Ruta absoluta
        // relativeTo: this.route,
        queryParams: this.queryParams,
        queryParamsHandling: 'merge'
      });
    }
  }

  ngOnDestroy() {
    if (this.map) {
      this.map.remove();
    }
  }
}
