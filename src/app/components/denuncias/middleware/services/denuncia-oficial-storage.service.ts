// En: src/app/modules/user/denuncias/services/denuncia-oficial-storage.service.ts

import { Injectable } from '@angular/core';
// Asegúrate de que esta ruta es correcta y que la interfaz es para la CREACIÓN
import { DenunciaOficialCreacionInterface } from '../../../admin/middleware/interfaces/denunciasOficialInterface';
 
@Injectable({
  providedIn: 'root'
})
export class DenunciaOficialStorageService {
  // Define una clave ÚNICA para el localStorage de denuncias oficiales
  private readonly localStorageKey = 'denunciaOficialInProgress'; // <--- CLAVE DIFERENTE

private denuncia: Partial<DenunciaOficialCreacionInterface & {
  pruebas?: string;
  audio?: string;
}> = {};  private pruebasFiles: File[] = [];
  private audioFiles: File[] = [];

  constructor() {
    this.loadFromLocalStorage();
  }

  setTipoDenuncia(tipo: string): void {
    this.denuncia.nombreTipo = tipo;
    this.saveToLocalStorage();
  }

  setSubtipoDenuncia(subtipo: string): void {
    this.denuncia.nombreSubtipo = subtipo;
    this.saveToLocalStorage();
  }

  // Renombrar a setDescripcionYEvidencia si quieres consistencia con la propuesta anterior
  // o mantener setDescripcionPruebas si prefieres
  setDescripcionYEvidencia(descripcion: string, pruebas?: File[], audio?: File[]): void {
    this.denuncia.descripcion = descripcion;

    if (pruebas && pruebas.length > 0) {
      this.pruebasFiles = [...pruebas]; // Usar spread para crear nueva referencia
      this.denuncia.pruebas = pruebas.map(file => file.name).join(',');
      console.log('Pruebas (Oficial) guardadas:', this.pruebasFiles.map(f => f.name));
    } else {
      this.pruebasFiles = [];
      delete this.denuncia.pruebas; // Limpiar si no hay pruebas
    }

    if (audio && audio.length > 0) {
      this.audioFiles = [...audio]; // Usar spread
      this.denuncia.audio = audio.map(file => file.name).join(',');
      console.log('Audio (Oficial) guardado:', this.audioFiles.map(f => f.name));
    } else {
      this.audioFiles = [];
      delete this.denuncia.audio; // Limpiar si no hay audio
    }

    this.saveToLocalStorage();
  }

  setDireccion(direccion: string): void {
    this.denuncia.direccion = direccion;
    this.saveToLocalStorage();
  }

  // Renombrar a getDenunciaData o similar para mayor claridad
  getDenunciaData(): Partial<DenunciaOficialCreacionInterface> {
    return { ...this.denuncia }; // Devolver copia
  }

  getPruebasFiles(): File[] {
    return [...this.pruebasFiles]; // Devolver copia
  }

  getAudioFiles(): File[] {
    return [...this.audioFiles]; // Devolver copia
  }

  // Renombrar a resetDenunciaOficial para claridad
  resetDenunciaOficial(): void {
    this.denuncia = {};
    this.pruebasFiles = [];
    this.audioFiles = [];
    localStorage.removeItem(this.localStorageKey); // <--- USA LA CLAVE CORRECTA
    console.log('Storage de denuncia OFICIAL limpiado.');
  }

  private saveToLocalStorage(): void {
    localStorage.setItem(this.localStorageKey, JSON.stringify(this.denuncia)); // <--- USA LA CLAVE CORRECTA
  }

  private loadFromLocalStorage(): void {
    const storedDenuncia = localStorage.getItem(this.localStorageKey); // <--- USA LA CLAVE CORRECTA
    if (storedDenuncia) {
      this.denuncia = JSON.parse(storedDenuncia);
      console.log('Denuncia OFICIAL cargada desde localStorage:', this.denuncia);
    }
  }
  setTipoIdentificacionDenunciante(tipo: string): void {
    this.denuncia.tipoIdentificacionDenunciante = tipo;
    this.saveToLocalStorage();
  }

  setNumeroIdentificacionDenunciante(numero: string): void {
    this.denuncia.numeroIdentificacionDenunciante = numero;
    this.saveToLocalStorage();
  }

  setNombreDenunciante(nombre: string): void {
    this.denuncia.nombreDenunciante = nombre;
    this.saveToLocalStorage();
  }

  setApellidoDenunciante(apellido: string): void {
    this.denuncia.apellidoDenunciante = apellido;
    this.saveToLocalStorage();
  }

  setFechaNacimientoDenunciante(fecha?: string): void { // Fecha es string "YYYY-MM-DD"
    this.denuncia.fechaNacimientoDenunciante = fecha;
    this.saveToLocalStorage();
  }

  setDenunciaEnNombreDeTercero(esTercero: boolean): void {
    this.denuncia.denunciaEnNombreDeTercero = esTercero;
    this.saveToLocalStorage();
  }

// También necesitarás setters para los campos del INCIDENTE que se recogerán en el nuevo componente
  setZonaIncidente(zona: string): void {
    this.denuncia.zonaIncidente = zona;
    this.saveToLocalStorage();
  }
  setCiudadIncidente(ciudad?: string): void {
    this.denuncia.ciudadIncidente = ciudad;
    this.saveToLocalStorage();
  }
  setBarrioIncidente(barrio?: string): void {
    this.denuncia.barrioIncidente = barrio;
    this.saveToLocalStorage();
  }
  setMunicipioIncidente(municipio?: string): void {
    this.denuncia.municipioIncidente = municipio;
    this.saveToLocalStorage();
  }
  setVeredaIncidente(vereda?: string): void {
    this.denuncia.veredaIncidente = vereda;
    this.saveToLocalStorage();
  }
  setFechaIncidente(fecha: string): void {
    this.denuncia.fechaIncidente = fecha;
    this.saveToLocalStorage();
  }
  setHoraIncidente(hora: string): void {
    this.denuncia.horaIncidente = hora;
    this.saveToLocalStorage();
  }
  setOcurrioViaPublica(ocurrio: boolean): void {
    this.denuncia.ocurrioViaPublica = ocurrio;
    this.saveToLocalStorage();
  }
}