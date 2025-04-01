import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { HeaderComponent } from './header/header.component';
import { CommonModule, ViewportScroller } from '@angular/common';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { BotInfoService } from '../../admin/layout/utils/botInfoCliente';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-inicio',
  imports: [HeaderComponent, CommonModule],
  templateUrl: './inicio.component.html',
  styleUrls: ['./inicio.component.css']
})
export class InicioComponent implements AfterViewInit, OnDestroy {
  // Canvas para la sección Territorios
  @ViewChild('terrainCanvas', { static: true }) terrainCanvasRef!: ElementRef<HTMLCanvasElement>;
  // Canvas para la sección Productos
  @ViewChild('productosCanvas', { static: true }) productosCanvasRef!: ElementRef<HTMLCanvasElement>;

  // Variables para la escena de Territorios
  territoryRenderer!: THREE.WebGLRenderer;
  territoryScene!: THREE.Scene;
  territoryCamera!: THREE.PerspectiveCamera;
  territoryControls!: OrbitControls;
  mapaModel!: THREE.Object3D;
  letrasModel!: THREE.Object3D;
  territoryFrameId: number = 0;

  // Variables para la escena de Productos
  productRenderer!: THREE.WebGLRenderer;
  productScene!: THREE.Scene;
  productCamera!: THREE.PerspectiveCamera;
  productControls!: OrbitControls;
  currentProductModel!: THREE.Object3D;
  productFrameId: number = 0;
  productModels: string[] = [
    'assets/models3d/apples.glb',
    'assets/models3d/potatoes.glb',
    'assets/models3d/pumpkin.glb'
  ];
  productNames: string[] = ['Manzanas', 'Papas', 'Calabaza'];
  currentProductIndex: number = 0;
  readonly DESIRED_PRODUCT_SIZE: number = 150;
  // Bandera para evitar carga concurrente de modelos
  isProductLoading: boolean = false;

  // Controla la visibilidad del modal (usado en ambas secciones)
  showModal: boolean = false;

  // Arreglo de secciones (IDs de elementos en el HTML) para el scroll
  private sections: string[] = ['hero', 'territorios', 'productos3d', 'caracteristicas', 'cta', 'footer'];
  private scrollSubscription!: Subscription;

  resizeHandler = () => this.onWindowResize();

  // Definimos un array de mensajes que el bot leerá (uno por cada sección)
  private infoInicio: string[] = [
    "Bienvenido a CampiAmigo, la plataforma que revoluciona la agricultura.",
    "Explora nuestros Territorios en 3D y conoce la topografía de Colombia.",
    "Descubre los Productos Agrícolas con vistas 360°.",
    "Conoce nuestras Características Principales y ventajas.",
    "Comienza a explorar hoy y transforma tu experiencia agrícola.",
    "Gracias por visitarnos, sigue navegando y descubre más."
  ];

  constructor(
    private viewportScroller: ViewportScroller,
    private router: Router,
    private botInfoService: BotInfoService,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    // Establece la lista de mensajes que leerá el bot.
    this.botInfoService.setInfoList(this.infoInicio);
  }

  ngAfterViewInit() {
    this.initTerritoryScene();
    this.initProductScene();
    this.animateTerritory();
    this.animateProduct();
    window.addEventListener('resize', this.resizeHandler, false);

    // Suscribirse al scrollIndex para hacer scroll en el contenido
    this.scrollSubscription = this.botInfoService.getScrollIndex().subscribe(index => {
      const sectionId = this.sections[index % this.sections.length];
      this.scrollTo(sectionId);
    });
  }

=======
  resizeHandler = () => this.onWindowResize();

  constructor(
    private viewportScroller: ViewportScroller,
    private router: Router,
    private toastr: ToastrService
  ) { }

  ngAfterViewInit() {
    this.initTerritoryScene();
    this.initProductScene();
    this.animateTerritory();
    this.animateProduct();
  }

>>>>>>> abde89c (Actualizar endpoint de desarrollo, mejorar estilos en componentes de autenticación y agregar funcionalidad de navegación hacia atrás.)
  // Función para hacer scroll a una sección con offset
  scrollTo(section: string) {
    const element = document.getElementById(section);
    if (element) {
<<<<<<< HEAD
=======
      // Offset negativo para dejar espacio y que se vea el título (ej. 60px)
>>>>>>> abde89c (Actualizar endpoint de desarrollo, mejorar estilos en componentes de autenticación y agregar funcionalidad de navegación hacia atrás.)
      const yOffset = -60;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  }

  /* Métodos para redirección y toast */
  onLogin() {
<<<<<<< HEAD
=======
    // Redirige a la ruta de login ('auth/login')
>>>>>>> abde89c (Actualizar endpoint de desarrollo, mejorar estilos en componentes de autenticación y agregar funcionalidad de navegación hacia atrás.)
    this.router.navigate(['auth/login']);
  }

  onRegister() {
<<<<<<< HEAD
=======
    // Redirige a la ruta de registro ('auth/register')
>>>>>>> abde89c (Actualizar endpoint de desarrollo, mejorar estilos en componentes de autenticación y agregar funcionalidad de navegación hacia atrás.)
    this.router.navigate(['auth/register']);
  }

  onInfo() {
<<<<<<< HEAD
=======
    // Muestra un toast de advertencia personalizado con ngx-toastr
>>>>>>> abde89c (Actualizar endpoint de desarrollo, mejorar estilos en componentes de autenticación y agregar funcionalidad de navegación hacia atrás.)
    this.toastr.warning('Por el momento esta funcionalidad no está lista.', 'Advertencia', {
      timeOut: 3000,
      progressBar: true,
      closeButton: true
    });
  }

  /*-------------------------------------------------------------------
    ESCENA DE TERRITORIOS (Sección 1)
  -------------------------------------------------------------------*/
  initTerritoryScene() {
    const canvas = this.terrainCanvasRef.nativeElement;
    const width = canvas.clientWidth || canvas.offsetWidth;
    const height = canvas.clientHeight || canvas.offsetHeight;

    this.territoryRenderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
    this.territoryRenderer.setPixelRatio(window.devicePixelRatio);
    this.territoryRenderer.setSize(width, height);

    this.territoryScene = new THREE.Scene();
    this.territoryScene.background = new THREE.Color(0x000000);

    this.territoryCamera = new THREE.PerspectiveCamera(60, width / height, 0.1, 100000);
    this.territoryCamera.position.set(0, 700, 1400);
    this.territoryCamera.lookAt(new THREE.Vector3(0, 0, 0));

    this.territoryControls = new OrbitControls(this.territoryCamera, this.territoryRenderer.domElement);
    this.territoryControls.enableRotate = false;
    this.territoryControls.enablePan = false;
    this.territoryControls.enableZoom = true;
    this.territoryControls.minDistance = 1250;
    this.territoryControls.maxDistance = 2000;

    const ambientLight = new THREE.AmbientLight(0xffffff, 1.8);
    this.territoryScene.add(ambientLight);

    this.loadTerritoryModels();
  }

  loadTerritoryModels() {
    const loader = new GLTFLoader();
    loader.load(
      'assets/models3d/mapa1.glb',
      (gltf) => {
        this.mapaModel = gltf.scene;
        this.mapaModel.position.set(0, 0, 0);
        this.mapaModel.scale.set(0.1, 0.1, 0.1);
        this.territoryScene.add(this.mapaModel);
        console.log('Mapa cargado en Territorios');
      },
      undefined,
      (error) => console.error('Error al cargar el mapa:', error)
    );

    loader.load(
      'assets/models3d/title.glb',
      (gltf) => {
        this.letrasModel = gltf.scene;
        this.letrasModel.position.set(-350, 550, 0);
        this.letrasModel.scale.set(120, 120, 120);
<<<<<<< HEAD
        this.letrasModel.rotation.set(0, -39.3, 5);
=======
        this.letrasModel.rotation.set(0, -39.5, 5);
>>>>>>> abde89c (Actualizar endpoint de desarrollo, mejorar estilos en componentes de autenticación y agregar funcionalidad de navegación hacia atrás.)
        this.letrasModel.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            if (mesh.material) {
              (mesh.material as THREE.MeshStandardMaterial).color.set(0xffffff);
            }
          }
        });
        this.territoryScene.add(this.letrasModel);
        console.log('Letras cargadas en Territorios');
      },
      undefined,
      (error) => console.error('Error al cargar las letras:', error)
    );
  }

  animateTerritory() {
    this.territoryFrameId = requestAnimationFrame(() => this.animateTerritory());
    if (this.mapaModel) {
      this.mapaModel.rotation.y += 0.005;
    }
    this.territoryControls.update();
    this.territoryRenderer.render(this.territoryScene, this.territoryCamera);
  }

  /*-------------------------------------------------------------------
    ESCENA DE PRODUCTOS (Sección 2)
  -------------------------------------------------------------------*/
  initProductScene() {
    const canvas = this.productosCanvasRef.nativeElement;
    const width = canvas.clientWidth || canvas.offsetWidth;
    const height = canvas.clientHeight || canvas.offsetHeight;

    this.productRenderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
    this.productRenderer.setPixelRatio(window.devicePixelRatio);
    this.productRenderer.setSize(width, height);

    this.productScene = new THREE.Scene();
    this.productScene.background = new THREE.Color(0xffffff);

    this.productCamera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    this.productCamera.position.set(0, 150, 200);
    this.productCamera.lookAt(new THREE.Vector3(0, 0, 0));

    this.productControls = new OrbitControls(this.productCamera, this.productRenderer.domElement);
    this.productControls.enableRotate = false;
    this.productControls.enablePan = false;
    this.productControls.enableZoom = true;
    this.productControls.minDistance = 150;
    this.productControls.maxDistance = 400;

    const ambientLight = new THREE.AmbientLight(0xffffff, 1.8);
    this.productScene.add(ambientLight);

    this.loadProductModel(this.currentProductIndex);
  }

  loadProductModel(index: number) {
<<<<<<< HEAD
    // Impide carga concurrente
    if (this.isProductLoading) {
      return;
    }
    this.isProductLoading = true;

    // Remueve el modelo actual si existe
=======
>>>>>>> abde89c (Actualizar endpoint de desarrollo, mejorar estilos en componentes de autenticación y agregar funcionalidad de navegación hacia atrás.)
    if (this.currentProductModel) {
      this.productScene.remove(this.currentProductModel);
    }
    const loader = new GLTFLoader();
    loader.load(
      this.productModels[index],
      (gltf) => {
        this.currentProductModel = gltf.scene;
        const box = new THREE.Box3().setFromObject(this.currentProductModel);
        const size = new THREE.Vector3();
        box.getSize(size);
        const maxSide = Math.max(size.x, size.y, size.z);
        const scaleFactor = this.DESIRED_PRODUCT_SIZE / maxSide;
        this.currentProductModel.scale.multiplyScalar(scaleFactor);
        box.setFromObject(this.currentProductModel);
        const center = new THREE.Vector3();
        box.getCenter(center);
        this.currentProductModel.position.sub(center);
        this.productScene.add(this.currentProductModel);
        console.log(`Producto ${index + 1} ("${this.productNames[index]}") cargado con factor de escala ${scaleFactor.toFixed(2)}`);
<<<<<<< HEAD
        // Finaliza la carga
        this.isProductLoading = false;
      },
      undefined,
      (error) => {
        console.error('Error al cargar el producto:', error);
        this.isProductLoading = false;
      }
=======
      },
      undefined,
      (error) => console.error('Error al cargar el producto:', error)
>>>>>>> abde89c (Actualizar endpoint de desarrollo, mejorar estilos en componentes de autenticación y agregar funcionalidad de navegación hacia atrás.)
    );
  }

  changeProductModel() {
<<<<<<< HEAD
    // Si ya se está cargando un modelo, se ignora el click
    if (this.isProductLoading) {
      return;
    }
=======
>>>>>>> abde89c (Actualizar endpoint de desarrollo, mejorar estilos en componentes de autenticación y agregar funcionalidad de navegación hacia atrás.)
    this.currentProductIndex = (this.currentProductIndex + 1) % this.productModels.length;
    this.loadProductModel(this.currentProductIndex);
  }

  animateProduct() {
    this.productFrameId = requestAnimationFrame(() => this.animateProduct());
    if (this.currentProductModel) {
      this.currentProductModel.rotation.y += 0.01;
    }
    this.productControls.update();
    this.productRenderer.render(this.productScene, this.productCamera);
  }

  /*-------------------------------------------------------------------
    MODAL (Para ambos casos)
  -------------------------------------------------------------------*/
  openModal() {
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  /*-------------------------------------------------------------------
    RESIZE y DESTRUCTOR
  -------------------------------------------------------------------*/
  onWindowResize() {
    const tCanvas = this.terrainCanvasRef.nativeElement;
    const tWidth = tCanvas.clientWidth || tCanvas.offsetWidth;
    const tHeight = tCanvas.clientHeight || tCanvas.offsetHeight;
    this.territoryCamera.aspect = tWidth / tHeight;
    this.territoryCamera.updateProjectionMatrix();
    this.territoryRenderer.setSize(tWidth, tHeight);

    const pCanvas = this.productosCanvasRef.nativeElement;
    const pWidth = pCanvas.clientWidth || pCanvas.offsetWidth;
    const pHeight = pCanvas.clientHeight || pCanvas.offsetHeight;
    this.productCamera.aspect = pWidth / pHeight;
    this.productCamera.updateProjectionMatrix();
    this.productRenderer.setSize(pWidth, pHeight);
  }

  ngOnDestroy() {
    if (this.territoryFrameId) {
      cancelAnimationFrame(this.territoryFrameId);
    }
    if (this.productFrameId) {
      cancelAnimationFrame(this.productFrameId);
    }
    window.removeEventListener('resize', this.resizeHandler, false);
<<<<<<< HEAD
    if (this.scrollSubscription) {
      this.scrollSubscription.unsubscribe();
    }
=======
>>>>>>> abde89c (Actualizar endpoint de desarrollo, mejorar estilos en componentes de autenticación y agregar funcionalidad de navegación hacia atrás.)
    console.log('Componente destruido.');
  }
}
