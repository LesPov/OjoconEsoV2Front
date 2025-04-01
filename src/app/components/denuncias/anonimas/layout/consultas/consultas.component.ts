import { Component, OnDestroy, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { BotInfoService } from '../../../../admin/layout/utils/botInfoCliente';
import { ConsultaDenunciaResponse } from '../../../middleware/interfaces/consultainterfaces';
import { DenunciasService } from '../../../middleware/services/denuncias.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as L from 'leaflet';

// Interfaz para la configuración de cada capa
interface TileLayerConfig {
  url: string;
  attribution: string;
  ext?: string;
}

@Component({
  selector: 'app-consultas',
  imports: [FormsModule, CommonModule],
  templateUrl: './consultas.component.html',
  styleUrls: ['./consultas.component.css']
})
export class ConsultasComponent implements OnInit, OnDestroy {
  claveUnica: string = '';
  denuncia: any = null;
  error: string = '';
  mapLoaded: boolean = false;
  private map!: L.Map;
  
  // Referencia al tile layer actual para poder removerlo al cambiar tema
  private currentTileLayer!: L.TileLayer;

  // Definimos la lista de temas que funcionan, agregando "Esri World Imagery"
  private tileLayers: { [key: string]: TileLayerConfig } = {
    "OpenStreetMap Standard": {
      url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      attribution: "© OpenStreetMap contributors"
    },
    "CartoDB Dark Matter": {
      url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
      attribution: "© OpenStreetMap contributors, © CartoDB"
    },

    "Stadia.AlidadeSatellite": {
      url: "https://tiles.stadiamaps.com/tiles/alidade_satellite/{z}/{x}/{y}{r}.{ext}",
      attribution: '&copy; CNES, Distribution Airbus DS, © Airbus DS, © PlanetObserver (Contains Copernicus Data) | &copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      ext: "jpg"
    }
  };

  // Arreglo de nombres de temas y un índice para saber cuál está activo
  private themeKeys: string[] = [
    "OpenStreetMap Standard",
    "CartoDB Dark Matter",
    "Stadia.AlidadeSatellite"
  ];
  private currentThemeIndex: number = 0;

  // Lista de mensajes para el bot
  private infoEvidenciaList: string[] = [
    "Consultas"
  ];

  constructor(
    private denunciasService: DenunciasService,
    private toastr: ToastrService,
    private botInfoService: BotInfoService
  ) {}

  ngOnInit(): void {
    this.botInfoService.setInfoList(this.infoEvidenciaList);
  }

  /**
   * Consulta la denuncia usando la clave única y, si se obtiene la respuesta,
   * inicia el proceso para renderizar el mapa con las coordenadas.
   */
  consultarDenuncia() {
    this.denuncia = null;
    this.error = '';
    this.mapLoaded = false;

    if (!this.claveUnica.trim()) {
      this.toastr.error('Por favor, ingresa una clave de radicado', 'Clave requerida');
      return;
    }

    console.log('Consultando denuncia con clave:', this.claveUnica);

    this.denunciasService.consultarDenunciaAnonima(this.claveUnica)
      .subscribe(
        (response: ConsultaDenunciaResponse) => {
          console.log('Respuesta de consulta:', response);
          this.denuncia = response.denuncia;
          if (typeof this.denuncia.pruebas === 'string') {
            this.denuncia.pruebas = [this.denuncia.pruebas];
          }
          console.log('Dirección recibida:', this.denuncia.direccion);
          this.initMapConsulta(this.denuncia.direccion);
        },
        (error) => {
          console.error('Error en la consulta:', error);
          this.denuncia = null;
          this.error = error.error.error;
          this.toastr.error('Clave incorrecta, por favor verifica', 'Error de consulta');
        }
      );
  }

  /**
   * Inicializa el mapa en el contenedor "mapConsulta" usando la dirección obtenida.
   */
  private async initMapConsulta(direccion: string) {
    try {
      let latitude: number, longitude: number;
      const regex = /\(Lat:\s*([\d\.\-]+),\s*Lng:\s*([\d\.\-]+)\)/;
      const match = direccion.match(regex);
      
      if (match) {
        latitude = parseFloat(match[1]);
        longitude = parseFloat(match[2]);
        console.log('Coordenadas extraídas del string:', latitude, longitude);
      } else {
        const cleanDireccion = direccion.split('(')[0].trim();
        console.log('Dirección limpia para geocodificación:', cleanDireccion);
        const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(cleanDireccion)}&format=json&limit=1`;
        const response = await fetch(url);
        const data = await response.json();
        if (data && data.length > 0) {
          latitude = parseFloat(data[0].lat);
          longitude = parseFloat(data[0].lon);
          console.log('Coordenadas obtenidas por geocodificación:', latitude, longitude);
        } else {
          console.error('No se encontraron datos en Nominatim para la dirección.');
          latitude = 4.6097;
          longitude = -74.0817;
          this.toastr.warning('No se pudieron obtener las coordenadas exactas, se usará una ubicación por defecto.');
        }
      }
      
      this.mapLoaded = true;
      setTimeout(() => {
        try {
          const selectedTheme = this.themeKeys[this.currentThemeIndex];
          const config = this.tileLayers[selectedTheme];
          this.map = L.map('mapConsulta', { zoomControl: false }).setView([latitude, longitude], 15);
          this.currentTileLayer = L.tileLayer(config.url, {
            attribution: config.attribution,
            ...(config.ext ? { ext: config.ext } : {})
          });
          this.currentTileLayer.addTo(this.map);
          L.marker([latitude, longitude]).addTo(this.map);
          console.log('Mapa inicializado correctamente con el tema:', selectedTheme);
        } catch (mapError) {
          console.error('Error al inicializar el mapa:', mapError);
          this.toastr.error('Error al inicializar el mapa', 'Error');
        }
      }, 0);
    } catch (error) {
      console.error('Error al geocodificar la dirección:', error);
      this.toastr.error('Error al geocodificar la dirección', 'Error');
    }
  }

  /**
   * Cambia el tema (tile layer) del mapa al siguiente de la lista.
   */
  changeTheme(): void {
    if (!this.map) {
      this.toastr.error('El mapa no está inicializado.', 'Error');
      return;
    }
    this.currentThemeIndex = (this.currentThemeIndex + 1) % this.themeKeys.length;
    const newTheme = this.themeKeys[this.currentThemeIndex];
    const config = this.tileLayers[newTheme];
    if (!config) {
      this.toastr.error('La configuración para el tema seleccionado no existe.', 'Error');
      return;
    }
    if (this.currentTileLayer) {
      this.map.removeLayer(this.currentTileLayer);
    }
    this.currentTileLayer = L.tileLayer(config.url, {
      attribution: config.attribution,
      ...(config.ext ? { ext: config.ext } : {})
    });
    this.currentTileLayer.addTo(this.map);
    console.log('Tema cambiado a:', newTheme);
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
    }
  }
}
