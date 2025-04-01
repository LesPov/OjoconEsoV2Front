import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { BotInfoService } from '../../../middleware/botInfoCliente';

@Component({
  selector: 'app-zone',
  imports: [RouterModule],
  templateUrl: './zone.component.html',
  styleUrl: './zone.component.css',

})
export class ZoneComponent {
  private infoZonaList: string[] = [
    "Estas viendo zonas",
   
  ];
  constructor(private botInfoService: BotInfoService) {}
    ngOnInit(): void {
      this.botInfoService.setInfoList(this.infoZonaList);
    }
}
