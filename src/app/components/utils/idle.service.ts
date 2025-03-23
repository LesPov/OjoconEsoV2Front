import { Injectable, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { fromEvent, merge, Subscription, timer } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { UserStatusService } from '../admin/services/user-status.service';

@Injectable({
  providedIn: 'root'
})
export class IdleService {
  private inactivityTime: number = 600000;
  private timerSubscription: Subscription = new Subscription();
  private activitySubscription: Subscription = new Subscription();

  constructor(
    private router: Router,
    private ngZone: NgZone,
    private toastr: ToastrService,
    private userStatusService: UserStatusService
  ) {
    this.initializeListener();
  }

  private initializeListener(): void {
    const activityEvents = merge(
      fromEvent(document, 'mousemove'),
      fromEvent(document, 'keydown'),
      fromEvent(document, 'click'),
      fromEvent(document, 'scroll'),
      fromEvent(document, 'touchstart')
    );

    this.activitySubscription = activityEvents.subscribe(() => {
      this.resetTimer();
    });

    this.startTimer();
  }

  private startTimer(): void {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }

    this.timerSubscription = timer(this.inactivityTime).subscribe(() => {
      this.ngZone.run(() => {
        this.logoutUser();
      });
    });
  }

  private resetTimer(): void {
    this.startTimer();
  }

  private logoutUser(): void {
    console.warn('Inactividad detectada. Cerrando sesión...');
    this.userStatusService.updateStatusInBackend('Desactivado');
    localStorage.clear();
    this.toastr.info('Sesión expirada por inactividad');
    this.router.navigate(['/login']);
  }
}
