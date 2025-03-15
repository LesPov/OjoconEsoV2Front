import { Component, ViewChild, ElementRef, OnDestroy, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { SceneService } from './scene/scene';

@Component({
  selector: 'app-scene',
  imports: [CommonModule],
  templateUrl: './scene.component.html',
  styleUrls: ['./scene.component.css']
})
export class SceneComponent implements AfterViewInit, OnDestroy {
  @ViewChild('rendererContainer', { static: true }) rendererContainer!: ElementRef;
  @ViewChild('loadingVideo', { static: false }) loadingVideo!: ElementRef<HTMLVideoElement>;

  isExpanded: boolean = false;
  engineState: boolean = false;
  modalVisible: boolean = false;
  modalInfo: string = '';
  zoneVideoSource: string = 'assets/videos/default.mp4';
  showOverlay: boolean = true;
  modelsLoaded: boolean = false;

  private indicatorSub!: Subscription;
  private modelsLoadedSub!: Subscription;

  constructor(
    private sceneService: SceneService,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) { }

  ngAfterViewInit(): void {
    this.route.paramMap.subscribe(params => {
      const zone = params.get('zoneId');
      console.log('Zone recibida:', zone);
      const videoMapping: { [key: string]: string } = {
        pascaCundinamarca: 'assets/videos/Cundinamarca/Pasca/pasca.mp4'
      };
      if (zone && videoMapping[zone]) {
        this.zoneVideoSource = videoMapping[zone];
        this.cdr.detectChanges();
      }
    });

    // Suscribirse al BehaviorSubject: si ya se emitió true, se asigna modelsLoaded
    this.modelsLoadedSub = this.sceneService.modelsLoaded$.subscribe(loaded => { 
      console.log('Estado de modelos cargados:', loaded);
      this.modelsLoaded = loaded;
      this.cdr.detectChanges();
    });

    this.sceneService.init(this.rendererContainer.nativeElement);
    window.addEventListener('resize', this.onResize);

    this.indicatorSub = this.sceneService.indicatorClick$.subscribe(index => {
      this.modalInfo = `Se ha seleccionado el indicador ${index + 1}`;
      this.openModal();
    });
  }

  ngOnDestroy(): void {
    if (this.indicatorSub) {
      this.indicatorSub.unsubscribe();
    }
    if (this.modelsLoadedSub) {
      this.modelsLoadedSub.unsubscribe();
    }
    window.removeEventListener('resize', this.onResize);
  }

  toggleSunAnimation(): void {
    this.sceneService.toggleSunAnimation();
  }

onViewModel(): void {
  console.log('Botón Ver Modelo clickeado');
  if (this.loadingVideo && this.loadingVideo.nativeElement) {
    const videoEl = this.loadingVideo.nativeElement;
    videoEl.pause(); // Pausa el video para evitar que se interrumpa la reproducción
  }
  this.showOverlay = false; // Luego quitas el overlay
}


  onVideoEnded(): void {
    console.log('Video finalizado, reiniciando');
    if (this.loadingVideo && this.loadingVideo.nativeElement) {
      const videoEl = this.loadingVideo.nativeElement;
      videoEl.currentTime = 0;
      videoEl.play().catch(err => console.error('Error reproduciendo el video:', err));
    }
  }
  

  get sunRotating(): boolean {
    return this.sceneService.isSunRotating();
  }

  private onResize = (): void => {
    this.sceneService.onWindowResize();
  };

  toggleMenu(): void {
    this.isExpanded = !this.isExpanded;
  }

  toggleEngine(): void {
    this.engineState = !this.engineState;
  }

  goToIndicator(index: number): void {
    this.sceneService.goToIndicator(index);
    this.isExpanded = false;
  }

  openModal(): void {
    this.modalVisible = true;
    console.log('Modal abierto:', this.modalInfo);
  }

  closeModal(): void {
    this.modalVisible = false;
    console.log('Modal cerrado');
  }

  onModalButtonClick(): void {
    console.log('Botón del modal presionado');
    this.closeModal();
  }
}
