import { Injectable } from '@angular/core';
import * as THREE from 'three';
import * as CANNON from 'cannon';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { CameraService } from '../utils/cameraService';
import { RendererService } from '../utils/rendererService';
import { ModeloPisoService } from '../utils/modelopiso';
import { LightingService } from '../utils/lightingService';
import { OrbitControlsService } from '../utils/orbitControlsService';
import { ModeloLetras } from '../utils/modeloLetras';
import { clampCameraToTerrain } from '../utils/camaraTerrain';
import { ModeloIndicador } from '../utils/modeloIndicador';
import { goToIndicator } from '../utils/goToIndicator';
import { onClick } from '../utils/onClick';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SceneService {
  private scene: THREE.Scene;
  private renderer!: THREE.WebGLRenderer;
  private camera!: THREE.PerspectiveCamera;
  private controls!: OrbitControls;
  private world!: CANNON.World;
  private clock = new THREE.Clock();
  private initialized: boolean = false;

  // BehaviorSubject para retener el estado de carga (inicialmente false)
  public modelsLoaded$ = new BehaviorSubject<boolean>(false);
  private totalModels: number = 3;
  private loadedModels: number = 0;

  // Para manejar indicadores y sus clics
  public indicators: ModeloIndicador[] = [];
  public indicatorClick$: Subject<number> = new Subject<number>();

  constructor(
    private cameraService: CameraService,
    private rendererService: RendererService,
    private modelo1: ModeloPisoService,
    private lightingService: LightingService,
    private orbitControlsService: OrbitControlsService,
    private modeloLetras: ModeloLetras,
    public modeloIndicador: ModeloIndicador,
  ) {
    this.scene = new THREE.Scene();
    this.world = new CANNON.World();
    this.world.gravity.set(0, -9.82, 0);
  }

  private onModelLoaded(): void {
    this.loadedModels++;
    console.log('Modelo cargado (' + this.loadedModels + '/' + this.totalModels + ')');
    if (this.loadedModels >= this.totalModels) {
      console.log('¡Todos los modelos han cargado!');
      this.modelsLoaded$.next(true);
    }
  }

  init(container: HTMLElement): void {
    if (this.initialized) {
      if (this.renderer && this.renderer.domElement.parentElement !== container) {
        if (this.renderer.domElement.parentElement) {
          this.renderer.domElement.parentElement.removeChild(this.renderer.domElement);
        }
        container.appendChild(this.renderer.domElement);
        this.renderer.domElement.addEventListener('contextmenu', event => event.preventDefault());
      }
      return;
    }

    // Configuración de cámara y renderizador
    this.cameraService.createDefaultCameras();
    this.cameraService.initCameraInfo(container);
    this.camera = this.cameraService.getActiveCamera();

    this.renderer = this.rendererService.getRenderer();
    container.appendChild(this.renderer.domElement);
    this.renderer.domElement.addEventListener('contextmenu', event => event.preventDefault());

    // Agregar luces
    const modelCenter = new THREE.Vector3(0, 0, 0);
    this.lightingService.addHemisphereLight(this.scene, modelCenter);

    // Cargar modelos y pasar callbacks
    this.modelo1.loadGLTFModel(this.scene, 'assets/models/mapa1.glb', this.world, undefined, () => this.onModelLoaded());
    this.modeloLetras.loadGLTFModel(this.scene, 'assets/models/TITULOPASCA.glb', () => this.onModelLoaded());
    this.modeloIndicador.loadGLTFModel(
      this.scene,
      'assets/models/llavero1.glb',
      this.world,
      new THREE.Vector3(2.5, 13, 5.5),
      10,
      () => this.onModelLoaded()
    );
    this.indicators.push(this.modeloIndicador);

    // Configurar controles
    this.controls = this.orbitControlsService.configureControls(
      this.cameraService.getActiveCamera(),
      this.renderer.domElement
    );

    // Configurar clics en la escena
    this.renderer.domElement.addEventListener('click', (event) =>
      onClick(event, this.renderer, this.cameraService, this.indicators, this.indicatorClick$)
    );

    // Iniciar animación
    this.animate();
    this.initialized = true;
  }

  public toggleSunAnimation(): void {
    this.lightingService.toggleSunRotation();
  }

  public isSunRotating(): boolean {
    return this.lightingService.isSunRotating();
  }

  public goToIndicator(index: number): void {
    goToIndicator(index, this.indicators, this.cameraService, this.controls);
  }

  private animate = (): void => {
    requestAnimationFrame(this.animate);
    const delta = this.clock.getDelta();
    this.controls.update();
    this.modeloIndicador.update(delta, this.camera);
    clampCameraToTerrain(this.modelo1, this.cameraService);
    this.modeloLetras.update(this.camera);
    this.lightingService.update();
    this.renderer.render(this.scene, this.camera);
  };

  onWindowResize(): void {
    const activeCamera = this.cameraService.getActiveCamera();
    activeCamera.aspect = window.innerWidth / window.innerHeight;
    activeCamera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}
