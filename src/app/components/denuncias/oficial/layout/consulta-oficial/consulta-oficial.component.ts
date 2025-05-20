import { Component, OnInit, OnDestroy } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { BotInfoService } from '../../../../admin/layout/utils/botInfoCliente';
import { DenunciasService } from '../../../middleware/services/denuncias.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as L from 'leaflet';
import { DenunciaOficialResponseInterface } from '../../../../admin/middleware/interfaces/denunciasOficialInterface';

interface TileLayerConfig {
  url: string;
  attribution: string;
  ext?: string;
}

@Component({
  selector: 'app-consulta-oficial',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './consulta-oficial.component.html',
  styleUrls: ['./consulta-oficial.component.css']
})
export class ConsultaOficialComponent implements OnInit, OnDestroy {
  claveUnica: string = '';
  denuncia: DenunciaOficialResponseInterface | null = null;
  error: string = '';
  mapLoaded: boolean = false;
  private map!: L.Map;
  private currentTileLayer!: L.TileLayer;

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
      attribution: '&copy; CNES ... contributors',
      ext: "jpg"
    }
  };
  private themeKeys = Object.keys(this.tileLayers);
  private currentThemeIndex = 0;
  private infoList = ['Consulta Oficial'];

  constructor(
    private denunciasService: DenunciasService,
    private toastr: ToastrService,
    private botInfoService: BotInfoService
  ) { }

  ngOnInit(): void {
    this.botInfoService.setInfoList(this.infoList);
  }

  consultarDenuncia(): void {
    this.denuncia = null;
    this.error = '';
    this.mapLoaded = false;

    if (!this.claveUnica.trim()) {
      this.toastr.error('Por favor, ingresa una clave de radicado', 'Clave requerida');
      return;
    }

    this.denunciasService.consultarDenunciaOficial(this.claveUnica)
      .subscribe(
        resp => {
          this.denuncia = resp.denuncia;
          // Normaliza pruebas
          if (this.denuncia.pruebas && typeof this.denuncia.pruebas === 'string') {
            (this.denuncia as any).pruebas = [this.denuncia.pruebas];
          }
          this.initMapConsulta(this.denuncia.direccion);
        },
        err => {
          console.error('Error en la consulta oficial:', err);

          // 1) Extraemos el body que nos envía el backend
          const payload = err.error || {};
          const backendMessage = payload.message  // el mensaje principal del back
            || 'Error inesperado en la consulta';
          const backendDetail = payload.error    // el detalle adicional
            || '';

          // 2) Lo guardamos en this.error (por si lo muestras en el template)
          this.error = backendMessage;

          // 3) Y mostramos el Toastr con el texto y título que venga del back
          //    primer arg: texto grande, segundo arg: título en negrita
          this.toastr.error(backendDetail || backendMessage);
        });
  }

  private async initMapConsulta(direccion: string) {
    let lat: number, lng: number;
    const regex = /\(Lat:\s*([\d\.\-]+),\s*Lng:\s*([\d\.\-]+)\)/;
    const match = direccion.match(regex);
    if (match) {
      lat = +match[1]; lng = +match[2];
    } else {
      const clean = direccion.split('(')[0].trim();
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(clean)}&format=json&limit=1`);
        const data = await res.json();
        if (data.length) {
          lat = +data[0].lat; lng = +data[0].lon;
        } else throw new Error();
      } catch {
        lat = 4.6097; lng = -74.0817;
        this.toastr.warning('Usando ubicación por defecto');
      }
    }
    this.mapLoaded = true;
    setTimeout(() => {
      this.map = L.map('mapConsulta', { zoomControl: false }).setView([lat, lng], 15);
      const theme = this.themeKeys[this.currentThemeIndex];
      const cfg = this.tileLayers[theme];
      this.currentTileLayer = L.tileLayer(cfg.url, { attribution: cfg.attribution, ...(cfg.ext ? { ext: cfg.ext } : {}) });
      this.currentTileLayer.addTo(this.map);
      L.marker([lat, lng]).addTo(this.map);
    }, 0);
  }

  changeTheme(): void {
    if (!this.map) {
      this.toastr.error('El mapa no está inicializado.', 'Error');
      return;
    }
    this.map.removeLayer(this.currentTileLayer);
    this.currentThemeIndex = (this.currentThemeIndex + 1) % this.themeKeys.length;
    const theme = this.themeKeys[this.currentThemeIndex];
    const cfg = this.tileLayers[theme];
    this.currentTileLayer = L.tileLayer(cfg.url, { attribution: cfg.attribution, ...(cfg.ext ? { ext: cfg.ext } : {}) });
    this.currentTileLayer.addTo(this.map);
  }

  ngOnDestroy(): void {
    if (this.map) { this.map.remove(); }
  }
}
