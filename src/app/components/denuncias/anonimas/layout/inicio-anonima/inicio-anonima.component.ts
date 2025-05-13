import { Component, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { BotInfoService } from '../../../../admin/layout/utils/botInfoCliente';
import { Location, CommonModule } from '@angular/common';

interface InfoBlock {
  heading: string;
  description: string;
  icons: string[];
}

@Component({
  selector: 'app-inicio-anonima',
  standalone: true,
  imports: [ CommonModule ],
  templateUrl: './inicio-anonima.component.html',
  styleUrls: ['./inicio-anonima.component.css']
})
export class InicioAnonimaComponent {
  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.handleScrollUpVisibility();
  }

  /** Reemplazamos infoListInicioAnonima con infoBlocks */
  public infoBlocks: InfoBlock[] = [
    {
      heading: '¿Cómo denunciar anónimamente?',
      description: 'En esta sección puedes realizar denuncias de forma anónima. Recuerda que una denuncia anónima te permite reportar situaciones sin revelar tu identidad, protegiendo así tu seguridad.',
      icons: [
        'https://cdn.prod.website-files.com/64c73d04a946980a4476537e/64d455088454ba4abb0cf9cc_Late%20for%20Class.svg'
      ]
    },
    {
      heading: 'Proceso guiado',
      description: 'Te guiaremos paso a paso en el proceso para que puedas completar toda la información necesaria.',
      icons: [
        'https://cdn.prod.website-files.com/64c73d04a946980a4476537e/64d456bfc7f9c0552d104382_Gamestation.svg'
      ]
    },
    {
      heading: 'Etapas del reporte',
      description: 'Recuerda que el proceso incluye varias etapas, como seleccionar el tipo de denuncia, agregar evidencias, indicar la ubicación del incidente, entre otras.',
      icons: [
        'https://cdn.prod.website-files.com/64c73d04a946980a4476537e/64d452e5aed374e1f7ce8cac_Reflecting.svg'
      ]
    }
  ];

  constructor(
    private router: Router,
    private toastr: ToastrService,
    private botInfoService: BotInfoService,
    private location: Location
  ) {}

  ngOnInit(): void {
    // Enviamos al bot la lista de headings+descripciones
    this.botInfoService.setInfoList(
      this.infoBlocks.map(b => `${b.heading}: ${b.description}`)
    );
    this.botInfoService.getScrollIndex().subscribe(i => this.scrollToParagraph(i));
  }

  scrollToParagraph(index: number): void {
    const items = document.querySelectorAll('.info_item p');
    if (items[index]) {
      (items[index] as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  goToConsulta() {
    this.router.navigate(['/body/consultas']);
  }

 goToCrear() {
  // Navega a tipos_de_denuncia con query param tipo=anonima
  this.router.navigate(
    ['/body/tipos_de_denuncia'],
    { queryParams: { tipo: 'anonima' } }
  );
}


  showWarning(): void {
    this.toastr.warning('En próximas actualizaciones se agregará.', 'Warning');
  }

  private handleScrollUpVisibility(): void {
    const up = document.getElementById('scroll-up');
    if (!up) return;
    if (window.scrollY >= 560) {
      up.classList.add('show-scroll');
      up.classList.remove('scrollup--inactive');
    } else {
      up.classList.remove('show-scroll');
      up.classList.add('scrollup--inactive');
    }
  }

  scrollToTop(): void {
    const step = -window.scrollY / 20;
    const iv = setInterval(() => {
      if (window.scrollY !== 0) {
        window.scrollBy(0, step);
      } else {
        clearInterval(iv);
        document.getElementById('scroll-up')?.classList.add('scrollup--inactive');
      }
    }, 16);
  }

  goBack(): void {
    this.location.back();
  }
}
