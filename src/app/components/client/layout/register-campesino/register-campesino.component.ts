import { Component } from '@angular/core';
import { BotInfoService } from '../../middleware/botInfoCliente';

@Component({
  selector: 'app-register-campesino',
  imports: [],
  templateUrl: './register-campesino.component.html',
  styleUrl: './register-campesino.component.css'
})
export class RegisterCampesinoComponent {
  private inforegisterList: string[] = [
    "Estás viendo una imagen que representa la comunidad campesina, base fundamental de CampiAmigo.",
    "Para completar tu registro como CampiAmigo, se realizará un proceso en dos etapas: la digital y la personal.",
    "En la etapa digital, recopilaremos y verificaremos tus datos a través de la plataforma.",
    "Posteriormente, en la etapa personal, revisaremos en detalle tu información de manera presencial.",
    "Una vez finalizado este registro personal, se llevará a cabo un estudio y en un plazo máximo de 10 días recibirás una respuesta.",
    "Pulsa el botón 'Aceptar' para continuar con el proceso de registro."
  ];

  constructor(private botInfoService: BotInfoService) {}

  ngOnInit(): void { 
    this.botInfoService.setInfoList(this.inforegisterList);
  }
}
