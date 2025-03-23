import { Component, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { BotInfoService } from '../../../../admin/layout/utils/botInfoCliente';
import { Location } from '@angular/common';

@Component({
  selector: 'app-inicio-anonima',
  imports: [],
  templateUrl: './inicio-anonima.component.html',
  styleUrls: ['./inicio-anonima.component.css']
})
export class InicioAnonimaComponent {
  @HostListener('window:scroll', []) 
  onWindowScroll() {
    this.handleScrollUpVisibility();
  }
  
  public infoListInicioAnonima: string[] = [ 
    "Como denunciar anonimamente",
    "En esta sección puedes realizar denuncias de forma anónima. Recuerda que una denuncia anónima te permite reportar situaciones sin revelar tu identidad, protegiendo así tu seguridad.",
    "Te guiaremos paso a paso en el proceso para que puedas completar toda la información necesaria.",
    "Recuerda que el proceso incluye varias etapas, como seleccionar el tipo de denuncia, agregar evidencias, indicar la ubicación del incidente, entre otras.",
  ];

  constructor(
    private router: Router,
    private toastr: ToastrService,
    private location: Location,

    private botInfoService: BotInfoService
  ) { }
  
  // Método opcional que muestra un mensaje y, además, el bot ya se invocará desde el header.
  showwarnig(): void {
    this.toastr.warning('En próximas actualizaciones se agregará.', 'Warning');
  }

  ngOnInit(): void {
    // Se establece la lista de información
    this.botInfoService.setInfoList(this.infoListInicioAnonima);
    // Se suscribe para recibir el índice emitido y hacer scroll al párrafo correspondiente
    this.botInfoService.getScrollIndex().subscribe(index => {
      this.scrollToParagraph(index);
    });
  }

  scrollToParagraph(index: number): void {
    const paragraphs = document.querySelectorAll('p');
    if (paragraphs[index]) {
      paragraphs[index].scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  goToConsulta() {
    this.router.navigate(['/body/consultas']);
  }

  goToCrear() {
    this.router.navigate(['/body/tipos_de_denuncia']);
  }

  private handleScrollUpVisibility(): void {
    const scrollUpElement = document.getElementById('scroll-up');
    if (scrollUpElement) {
      if (window.scrollY >= 560) {
        scrollUpElement.classList.add('show-scroll');
        scrollUpElement.classList.remove('scrollup--inactive');
      } else {
        scrollUpElement.classList.remove('show-scroll');
        scrollUpElement.classList.add('scrollup--inactive');
      }
    }
  }
  
  scrollToTop(): void {
    const scrollStep = -window.scrollY / 20;
    const scrollInterval = setInterval(() => {
      if (window.scrollY !== 0) {
        window.scrollBy(0, scrollStep);
      } else {
        clearInterval(scrollInterval);
        const scrollUpElement = document.getElementById('scroll-up');
        if (scrollUpElement) {
          scrollUpElement.classList.add('scrollup--inactive');
        }
      }
    }, 16);
  }
   // Método para volver
   goBack(): void {
    this.location.back();
  }
  
}
