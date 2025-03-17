import { Component } from '@angular/core';
import { BotInfoService } from '../../../client/middleware/botInfoCliente';

@Component({
  selector: 'app-campesino-dashboard',
  imports: [],
  templateUrl: './campesino-dashboard.component.html',
  styleUrl: './campesino-dashboard.component.css'
})
export class CampesinoDashboardComponent {
  private infoCampesinoDashboardList: string[] = [
    "Estas viendo incio de campiamigo",
   
  ];
  constructor(private botInfoService: BotInfoService) {}
    ngOnInit(): void {
      this.botInfoService.setInfoList(this.infoCampesinoDashboardList);
    } 
}
