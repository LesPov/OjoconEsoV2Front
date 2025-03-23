import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

declare var responsiveVoice: any;

@Injectable({
  providedIn: 'root'
})
export class BotInfoService {
  private currentInfoList: string[] = [];
  // Se utiliza infoIndexSubject para saber qué info leer y scrollIndexSubject para emitir el índice a hacer scroll.
  private infoIndexSubject = new BehaviorSubject<number>(0);
  private scrollIndexSubject = new BehaviorSubject<number>(0);
  private isPaused = false;
  private isSpeaking = false;

  constructor() {
    if (responsiveVoice) {
      responsiveVoice.init();
    }
  }

  setInfoList(infoList: string[]): void {
    this.currentInfoList = infoList;
    this.infoIndexSubject.next(0);
  }

  getNextInfo(): string {
    const currentIndex = this.infoIndexSubject.value;
    if (this.currentInfoList.length === 0) return "No hay información disponible.";
    const info = this.currentInfoList[currentIndex];
    // Incrementa el índice (cíclicamente)
    this.infoIndexSubject.next((currentIndex + 1) % this.currentInfoList.length);
    return info;
  }

  getSingleInfo(): string {
    return this.currentInfoList.length > 0 ? this.currentInfoList[0] : "No hay información disponible.";
  }

  getScrollIndex(): Observable<number> {
    return this.scrollIndexSubject.asObservable();
  }

  speak(text: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (responsiveVoice) {
        this.cancelSpeak();
        this.isSpeaking = true;

        responsiveVoice.speak(text, "Spanish Latin American Female", {
          pitch: 1.1,
          rate: 1.2,
          onend: () => {
            this.isSpeaking = false;
            resolve();
          },
          onerror: (error: any) => {
            this.isSpeaking = false;
            reject(error);
          }
        });
      } else {
        reject('ResponsiveVoice no está disponible.');
      }
    });
  }

  pauseSpeak(): void {
    if (responsiveVoice && this.isSpeaking && !this.isPaused) {
      responsiveVoice.pause();
      this.isPaused = true;
    }
  }

  resumeSpeak(): void {
    if (responsiveVoice && this.isPaused) {
      responsiveVoice.resume();
      this.isPaused = false;
    }
  }

  cancelSpeak(): void {
    if (responsiveVoice) {
      responsiveVoice.cancel();
      this.isPaused = false;
      this.isSpeaking = false;
    }
  }

  isSpeakingNow(): boolean {
    return this.isSpeaking;
  }

  // Combina la lectura y la emisión del índice para scroll
  speakNextAndScroll(): Promise<void> {
    const currentIndex = this.infoIndexSubject.value;
    const text = this.getNextInfo();
    // Emite el índice actual para que se haga scroll en el contenido
    this.scrollIndexSubject.next(currentIndex);
    return this.speak(text);
  }
}
