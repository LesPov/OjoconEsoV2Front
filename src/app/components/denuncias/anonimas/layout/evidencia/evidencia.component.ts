import { ChangeDetectorRef, Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { BotInfoService } from '../../../../admin/layout/utils/botInfoCliente';
import { DenunciaStorageService } from '../../../middleware/services/denunciaStorage.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../navbar/navbar.component';

interface MultimediaItem {
  file: File;
  url: string;
}

@Component({ 
  selector: 'app-evidencia',
  imports: [FormsModule, CommonModule, NavbarComponent],
  templateUrl: './evidencia.component.html',
  styleUrls: ['./evidencia.component.css']  // Asegúrate de usar styleUrls (con "s")
})
export class EvidenciaComponent implements OnInit, OnDestroy {
  subtipoDenuncia: string | null = null;
  currentStep = 1;
  totalSteps = 3;
  // Usamos un arreglo de objetos MultimediaItem en lugar de solo File[]
  selectedMultimedia: MultimediaItem[] = [];
  descripcion: string = '';
  minimumWords: number = 10;
  wordCount: number = 0;
  showError: boolean = false;
  isRecording = false;
  mediaRecorder: MediaRecorder | null = null;
  audioChunks: Blob[] = [];
  audioUrl: string | null = null;
  maxRecordingTime = 60000;
  recordingTimeout: any;
  audioBlob: Blob | null = null;
  currentStream: MediaStream | null = null;
  showCamera = false;
  videoStream: MediaStream | null = null;
  videoElement: HTMLVideoElement | null = null;

  // Límites de archivos
  readonly MAX_TOTAL_FILES = 10;
  readonly MAX_CAMERA_FILES = 5;
  cameraFileCount = 0;
  // Propiedades para modo de captura
  isPhotoMode: boolean = true;
  isRecordingVideo: boolean = false;
  videoRecorder: MediaRecorder | null = null;
  recordedChunks: Blob[] = [];
  videoBlob: Blob | null = null;
  private currentVideoStream: MediaStream | null = null;

  // Lista de mensajes
  private infoEvidenciaList: string[] = [
    "Bienvenido a la sección de evidencia. Aquí podrás subir archivos multimedia relacionados con tu denuncia.",
    "Puedes agregar una descripción detallada de la evidencia que estás subiendo.",
    "Selecciona una imagen, video o audio que respalde tu denuncia.",
    "Si lo prefieres, puedes grabar un mensaje de audio como parte de tu evidencia.",
    "Recuerda que toda la evidencia que proporciones ayudará a mejorar la atención a tu denuncia.",
    "Gracias por subir tu evidencia. Puedes continuar con el siguiente paso cuando estés listo."
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private denunciaStorage: DenunciaStorageService,
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef,
    private botInfoService: BotInfoService
  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.subtipoDenuncia = params.get('nombreSubTipoDenuncia');
    });
    // Asignar la lista de mensajes al bot
    this.botInfoService.setInfoList(this.infoEvidenciaList);
  }

  //////////////////////// MÉTODOS DE GRABACIÓN Y CAPTURA //////////////////////

  selectMode(mode: string) {
    this.isPhotoMode = mode === 'photo';
  }

  async toggleVideoRecording() {
    if (!this.isRecordingVideo) {
      await this.startVideoRecording();
    } else {
      await this.stopVideoRecording();
    }
    this.cdr.detectChanges();
  }

  private async startVideoRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: true
      });
      this.currentVideoStream = stream;
      this.videoRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm; codecs=vp8,opus'
      });
      this.recordedChunks = [];
      this.videoRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.recordedChunks.push(event.data);
        }
      };
      this.videoRecorder.onstop = () => {
        this.cleanupVideoStream();
        this.videoBlob = new Blob(this.recordedChunks, { type: 'video/webm' });
        const videoFile = new File([this.videoBlob], `video-${Date.now()}.webm`, { type: 'video/webm' });
        // Agregamos el archivo junto con su URL pre-calculada
        const item: MultimediaItem = { file: videoFile, url: URL.createObjectURL(videoFile) };
        this.selectedMultimedia.push(item);
        this.cdr.detectChanges();
      };
      this.videoRecorder.start();
      this.isRecordingVideo = true;
    } catch (error) {
      this.toastr.error('No se pudo iniciar la grabación de video con audio');
      console.error('Error al iniciar la grabación de video con audio:', error);
      this.cleanupVideoStream();
    }
  }

  private async stopVideoRecording() {
    if (this.videoRecorder && this.isRecordingVideo) {
      this.videoRecorder.stop();
      this.isRecordingVideo = false;
      this.closeCamera();
      this.toastr.success('El video se ha guardado y está listo para visualizarse.');
    }
  }

  private cleanupVideoStream() {
    if (this.currentVideoStream) {
      this.currentVideoStream.getTracks().forEach(track => track.stop());
      this.currentVideoStream = null;
    }
  }

  async initCamera() {
    try {
      if (!this.checkPhotoLimits()) return;
      this.showCamera = true;
      const stream = await this.startCameraStream();
      this.initializeVideoElement(stream);
      this.cdr.detectChanges();
    } catch (error) {
      this.handleCameraError(error);
    }
  }
  
  private checkPhotoLimits(): boolean {
    if (!this.canTakeMorePhotos()) {
      this.displayLimitError();
      return false;
    }
    return true;
  }

  private displayLimitError() {
    if (this.cameraFileCount >= this.MAX_CAMERA_FILES) {
      this.toastr.error(`Has alcanzado el límite de ${this.MAX_CAMERA_FILES} fotos con la cámara`);
    } else {
      this.toastr.error(`Has alcanzado el límite total de ${this.MAX_TOTAL_FILES} archivos multimedia`);
    }
  }

  private async startCameraStream(): Promise<MediaStream> {
    return navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment' },
      audio: false
    });
  }

  private initializeVideoElement(stream: MediaStream) {
    setTimeout(() => {
      this.videoElement = document.querySelector('#cameraFeed');
      if (this.videoElement) {
        this.videoElement.srcObject = stream;
        this.videoStream = stream;
      }
    }, 100);
  }

  private handleCameraError(error: any) {
    console.error('Error accessing camera:', error);
    this.toastr.error('No se pudo acceder a la cámara');
    this.closeCamera();
  }

  async capturePhoto() {
    if (!this.validatePhotoLimits()) return;
    if (!this.videoElement) return;
    try {
      const photoBlob = await this.captureImageFromVideo();
      const photoFile = this.createPhotoFile(photoBlob);
      this.addPhotoToGallery(photoFile);
      this.showSuccessMessage();
      this.closeCamera();
    } catch (error) {
      this.handleCaptureError(error);
    }
  }

  private validatePhotoLimits(): boolean {
    if (this.cameraFileCount >= this.MAX_CAMERA_FILES) {
      this.toastr.error(`Solo puedes tomar un máximo de ${this.MAX_CAMERA_FILES} fotos con la cámara`);
      this.closeCamera();
      return false;
    }
    if (this.selectedMultimedia.length >= this.MAX_TOTAL_FILES) {
      this.toastr.error(`Has alcanzado el límite máximo de ${this.MAX_TOTAL_FILES} archivos multimedia`);
      this.closeCamera();
      return false;
    }
    return true;
  }

  private async captureImageFromVideo(): Promise<Blob> {
    const canvas = document.createElement('canvas');
    canvas.width = this.videoElement!.videoWidth;
    canvas.height = this.videoElement!.videoHeight;
    const context = canvas.getContext('2d');
    if (!context) throw new Error("No se pudo obtener el contexto del canvas");
    context.drawImage(this.videoElement!, 0, 0, canvas.width, canvas.height);
    return new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error("No se pudo capturar la imagen"));
      }, 'image/jpeg', 0.95);
    });
  }

  private createPhotoFile(blob: Blob): File {
    return new File([blob], `camera-capture-${Date.now()}.jpg`, { type: 'image/jpeg' });
  }

  private addPhotoToGallery(file: File) {
    this.cameraFileCount++;
    const item: MultimediaItem = { file, url: URL.createObjectURL(file) };
    this.selectedMultimedia = [...this.selectedMultimedia, item];
    this.cdr.detectChanges();
  }

  private showSuccessMessage() {
    this.toastr.success('Foto capturada exitosamente');
  }

  private handleCaptureError(error: any) {
    console.error('Error capturing photo:', error);
    this.toastr.error('Error al capturar la foto');
  }

  closeCamera() {
    if (this.isRecordingVideo) {
      this.stopVideoRecording();
    }
    this.cleanupVideoStream();
    if (this.videoStream) {
      this.videoStream.getTracks().forEach(track => track.stop());
      this.videoStream = null;
    }
    this.showCamera = false;
    this.videoElement = null;
    this.cdr.detectChanges();
  }

  /////////////////////////////////////////////////////////////////////////////////

  onDescripcionChange(event: Event) {
    const input = event.target as HTMLTextAreaElement;
    this.descripcion = input.value;
    const words = this.descripcion.trim().split(/\s+/).filter(word => word.length > 0);
    this.wordCount = words.length;
    this.showError = this.descripcion.trim().length > 0 && this.wordCount < this.minimumWords;
  }

  async toggleRecording() {
    if (!this.isRecording) {
      this.clearAudioRecording();
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        this.currentStream = stream;
        this.startRecording(stream);
      } catch (error) {
        this.toastr.error('No se pudo acceder al micrófono');
        console.error('Error al acceder al micrófono:', error);
      }
    } else {
      await this.stopRecording();
    }
  }

  private clearAudioRecording() {
    if (this.audioUrl) {
      URL.revokeObjectURL(this.audioUrl);
    }
    this.audioUrl = null;
    this.audioChunks = [];
    this.cdr.detectChanges();
  }

  private startRecording(stream: MediaStream) {
    this.audioChunks = [];
    this.mediaRecorder = new MediaRecorder(stream);
    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        this.audioChunks.push(event.data);
      }
    };
    this.mediaRecorder.start();
    this.isRecording = true;
    this.cdr.detectChanges();
    setTimeout(() => {
      if (this.isRecording) {
        this.stopRecording();
        this.toastr.info('La grabación ha alcanzado el límite de 1 minuto');
      }
    }, this.maxRecordingTime);
  }

  private async stopRecording() {
    if (this.mediaRecorder && this.isRecording) {
      this.isRecording = false;
      return new Promise<void>((resolve) => {
        this.mediaRecorder!.onstop = () => {
          this.audioBlob = new Blob(this.audioChunks, { type: 'audio/wav' });
          this.audioUrl = URL.createObjectURL(this.audioBlob);
          if (this.currentStream) {
            this.currentStream.getTracks().forEach(track => track.stop());
            this.currentStream = null;
          }
          this.cdr.detectChanges();
          resolve();
        };
        this.mediaRecorder!.stop();
      });
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    const newFiles = Array.from(input.files);
    const totalNewFiles = newFiles.length;
    const currentTotal = this.selectedMultimedia.length;
    if (!this.validateTotalFileLimit(totalNewFiles, currentTotal)) {
      input.value = '';
      return;
    }
    if (!this.validateFileTypes(newFiles)) {
      input.value = '';
      return;
    }
    this.addFilesToGallery(newFiles);
    input.value = '';
  }

  private validateTotalFileLimit(totalNewFiles: number, currentTotal: number): boolean {
    if (currentTotal + totalNewFiles > this.MAX_TOTAL_FILES) {
      this.toastr.error(`Solo puedes subir un máximo de ${this.MAX_TOTAL_FILES} archivos en total. Actualmente tienes ${currentTotal} archivo(s).`);
      return false;
    }
    return true;
  }

  private validateFileTypes(files: File[]): boolean {
    const invalidFiles = files.filter(file => !this.isImage(file) && !this.isVideo(file));
    if (invalidFiles.length > 0) {
      this.toastr.error('Solo se permiten archivos de imagen o video');
      return false;
    }
    return true;
  }

  private addFilesToGallery(files: File[]) {
    const nuevosItems = files.map(file => {
      return { file, url: URL.createObjectURL(file) } as MultimediaItem;
    });
    this.selectedMultimedia = [...this.selectedMultimedia, ...nuevosItems];
    this.cdr.detectChanges();
    this.toastr.success(`Se agregaron ${files.length} archivo(s). Total: ${this.selectedMultimedia.length} de ${this.MAX_TOTAL_FILES}`);
  }

  triggerFileUpload(): void {
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    fileInput.click();
  }

  removeFile(index: number): void {
    const item = this.selectedMultimedia[index];
    // Si el archivo es de cámara, decrementar el contador
    if (item.file.name.startsWith('camera-capture-')) {
      this.cameraFileCount--;
    }
    // Revocar el URL creado para liberar memoria
    URL.revokeObjectURL(item.url);
    this.selectedMultimedia = this.selectedMultimedia.filter((_, i) => i !== index);
    this.toastr.info(`Archivo eliminado. Total: ${this.selectedMultimedia.length} de ${this.MAX_TOTAL_FILES}`);
    this.cdr.detectChanges();
  }

  canAddMoreFiles(): boolean {
    return this.selectedMultimedia.length < this.MAX_TOTAL_FILES;
  }

  canTakeMorePhotos(): boolean {
    return this.cameraFileCount < this.MAX_CAMERA_FILES && this.canAddMoreFiles();
  }

  isImage(file: File): boolean {
    return file.type.startsWith('image/');
  }

  isVideo(file: File): boolean {
    return file.type.startsWith('video/');
  }

  handleContinue(): void {
    if (this.descripcion.trim().length === 0) {
      this.toastr.error('Debes ingresar una descripción para continuar');
      return;
    }
    if (this.wordCount < this.minimumWords) {
      this.toastr.error(`La descripción debe contener al menos ${this.minimumWords} palabras`);
      return;
    }
    let audioFiles: File[] = [];
    if (this.audioBlob) {
      const audioFile = new File([this.audioBlob], `${Date.now()}-audio.wav`, { type: 'audio/wav' });
      audioFiles.push(audioFile);
    }
    // Extraer solo los File de cada MultimediaItem
    const multimediaFiles = this.selectedMultimedia.map(item => item.file);
    this.denunciaStorage.setDescripcionPruebas(
      this.descripcion,
      multimediaFiles,
      audioFiles
    );
    this.router.navigate(['/body/ubicacion']);
  }

  ngOnDestroy() {
    this.stopVideoRecording();
    this.cleanupVideoStream();
    this.closeCamera();
    this.clearAudioRecording();
    if (this.currentStream) {
      this.currentStream.getTracks().forEach(track => track.stop());
      this.currentStream = null;
    }
  }
}
