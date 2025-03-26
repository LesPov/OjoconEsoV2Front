import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import L from 'leaflet';
import { ToastrService } from 'ngx-toastr';
import { ProfileService } from '../../../../auth/layout/profile/services/profileServices';
import { BotInfoService } from '../../../../admin/layout/utils/botInfoCliente';

@Component({
  selector: 'app-ubicacion',
  imports: [],
  templateUrl: './ubicacion.component.html',
  styleUrl: './ubicacion.component.css'
})
export class UbicacionComponent  implements OnInit, OnDestroy {

  private map!: L.Map;
  private marker: L.Marker | null = null;
  selectedLocation: { lat: number; lng: number } | null = null;
  direccionSeleccionada: string = '';
  isLoading: boolean = false;
  isRegistered: boolean = false;

  private infoUbicacion: string[] = [
    "Bienvenido a la sección de selección de ubicación.",
    "Se intentará detectar tu ubicación automáticamente. Si no es posible, selecciona un punto en el mapa.",
    "Haz clic en el mapa para elegir el lugar del incidente.",
    "Una vez seleccionada la ubicación, presiona el botón 'Continuar' para avanzar."
  ];

  constructor(
    private router: Router,
    private toastr: ToastrService,
    private botInfoService: BotInfoService,
    private profileService: ProfileService
  ) { }

  ngOnInit(): void {
    this.botInfoService.setInfoList(this.infoUbicacion);
    // Consultamos el perfil para validar si el usuario ya está registrado
    this.profileService.getProfile().subscribe(
      profile => {
         if (profile && profile.campiamigo) {
             this.isRegistered = true;
             this.toastr.info('Ya estás registrado, redirigiendo al Dashboard.');
             // Redirige automáticamente al Dashboard si ya está registrado
             this.router.navigate(['/user/dashboard']);
         } else {
           // Si no está registrado, inicializamos el mapa y solicitamos la ubicación
           this.requestUserLocation();
         }
      },
      error => {
         console.error('Error al obtener el perfil:', error);
         this.requestUserLocation();
      }
    );
  }

  private requestUserLocation(): void {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          this.initializeMap(latitude, longitude);
          // Coloca un marcador inicial en la ubicación detectada
          this.handleMapClick({ latlng: { lat: latitude, lng: longitude } } as L.LeafletMouseEvent);
        },
        (error) => {
          this.toastr.error('No se pudo obtener la ubicación actual. Usa el mapa para seleccionar una ubicación.');
          this.initializeMap(4.6097, -74.0817); // Coordenadas por defecto
        }
      );
    } else {
      this.toastr.error('Tu dispositivo no soporta geolocalización. Selecciona la ubicación manualmente.');
      this.initializeMap(4.6097, -74.0817);
    }
  }

  private initializeMap(lat: number, lng: number): void {
    if (this.map) { return; }
    this.map = L.map('map', { zoomControl: false }).setView([lat, lng], 13);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '© OpenStreetMap contributors, © CartoDB'
    }).addTo(this.map);
    this.map.on('click', (e: L.LeafletMouseEvent) => {
      this.handleMapClick(e);
    });
  }

  private async handleMapClick(e: L.LeafletMouseEvent): Promise<void> {
    const { lat, lng } = e.latlng;
    if (this.marker) {
      this.marker.setLatLng([lat, lng]);
    } else {
      this.marker = L.marker([lat, lng]).addTo(this.map);
    }
    this.selectedLocation = { lat, lng };
    await this.obtenerDireccion(lat, lng);
  }

  private async obtenerDireccion(lat: number, lng: number): Promise<void> {
    this.isLoading = true;
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`);
      const data = await response.json();
      if (data.address) {
        let formattedAddress = this.formatAddress(data.address);
        if (!formattedAddress && data.display_name) {
          formattedAddress = data.display_name;
        }
        this.direccionSeleccionada = `${formattedAddress} (Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)})`;
      } else {
        this.direccionSeleccionada = `Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)}`;
      }
      this.toastr.success('Ubicación seleccionada correctamente');
    } catch (error) {
      this.toastr.error('Error al obtener la dirección');
      this.direccionSeleccionada = `Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)}`;
    } finally {
      this.isLoading = false;
    }
  }

  private formatAddress(address: any): string {
    if (address.road && address.house_number) {
      let formatted = `${address.road} #${address.house_number}`;
      if (address.neighbourhood || address.suburb) {
        formatted += `, ${address.neighbourhood || address.suburb}`;
      }
      if (address.city || address.town || address.village) {
        formatted += `, ${address.city || address.town || address.village}`;
      }
      return formatted;
    } else if (address.road) {
      return address.road;
    } else if (address.display_name) {
      const parts = address.display_name.split(',');
      return parts.slice(0, 2).map((p: string) => p.trim()).join(', ');
    }
    return '';
  }

  centrarEnUbicacionActual(): void {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          this.map.setView([latitude, longitude], 13);
          this.handleMapClick({ latlng: { lat: latitude, lng: longitude } } as L.LeafletMouseEvent);
          this.toastr.success('Ubicación actualizada');
        },
        (error) => {
          this.toastr.error('No se pudo obtener la ubicación actual');
        }
      );
    } else {
      this.toastr.error('Tu dispositivo no soporta geolocalización');
    }
  }

  // Al presionar "Continuar", se valida que se haya seleccionado una ubicación y que el usuario no esté registrado.
  handleContinue(): void {
    if (this.isRegistered) {
       this.toastr.warning('Ya estás registrado, no se permite actualizar la ubicación.');
       return;
    }
    if (!this.selectedLocation) {
      this.toastr.error('Por favor, selecciona una ubicación en el mapa');
      return;
    }
    const userLocation = {
      direccion: this.direccionSeleccionada,
      coords: this.selectedLocation
    };
    localStorage.setItem('userLocation', JSON.stringify(userLocation));
    this.router.navigate(['/user/registerCampiamigo']);
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
    }
  }
}
