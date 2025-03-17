import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { IdleService } from './components/utils/idle.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'FrontVentaMarket';
  constructor(private idleService: IdleService) {
    // Al inyectar IdleService en el constructor, se inicializa y empieza a monitorear la inactividad.
  }
}
