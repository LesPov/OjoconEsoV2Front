import { Component, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { BotInfoService } from '../../../../admin/layout/utils/botInfoCliente';
import { CommonModule, Location } from '@angular/common';

interface InfoBlock {
  heading: string;
  description: string;
  icons: string[];
}

@Component({
  selector: 'app-inicio-oficial',
  imports: [CommonModule],
  templateUrl: './inicio-oficial.component.html',
  styleUrls: ['./inicio-oficial.component.css']
})
export class InicioOficialComponent {
  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.handleScrollUpVisibility();
  }

  /** Estructura con más detalle y varios íconos */
  public infoBlocks: InfoBlock[] = [
    {
      heading: '¿Cómo denunciar Oficialmente?',
      description: 'En esta sección puedes realizar denuncias oficiales. Recuerda que una denuncia oficial requiere que proporciones información detallada y veraz sobre el incidente.',
      icons: []       // <- ningún icono para este bloque
    },
    {
      heading: 'Registro de identidad',
      description: 'Para poder dar seguimiento a tu denuncia, necesitamos tu nombre completo, número de cédula y dirección de correo válida. Toda la información se mantiene segura y confidencial.',
      icons: [
        'https://img.freepik.com/vector-gratis/ilustracion-concepto-inicio-sesion_114360-739.jpg?ga=GA1.1.2090848934.1742857988&w=740',
      ]
    },
    {
      heading: 'Datos de contacto',
      description: 'Además de tu correo, te pediremos un número de teléfono móvil. En caso de requerir aclaraciones, nuestro equipo podrá contactarte rápidamente.',
      icons: [
        'https://img.freepik.com/vector-gratis/ilustracion-concepto-bandeja-entrada-movil_114360-4014.jpg?t=st=1747068022~exp=1747071622~hmac=b01243ae5888a929e26855f01bd914d7a202946449f3c223fa0617149469157d&w=996',
      ]
    },
    {
      heading: 'Evidencias y anexos',
      description: 'Adjunta fotos, documentos PDF, videos o cualquier archivo que respalde tu caso. Cuanta más información aportes, más eficaz será la investigación.',
      icons: [
        'https://img.freepik.com/vector-gratis/ilustracion-concepto-politica-privacidad_114360-7478.jpg?ga=GA1.1.2090848934.1742857988&w=740',
      ]
    },
    {
      heading: 'Descripción detallada',
      description: 'Describe con claridad qué sucedió: fecha, hora aproximada, personas involucradas y circunstancias. Esto ayudará a las autoridades a comprender mejor el contexto.',
      icons: [
        'https://img.freepik.com/vector-gratis/ilustracion-concepto-aceptar-terminos_114360-1277.jpg?ga=GA1.1.2090848934.1742857988&semt=ais_hybrid&w=740',
      ]
    },
    {
      heading: 'Ubicación exacta',
      description: 'Indica la dirección precisa o usa el mapa interactivo para marcar el punto exacto del incidente. La precisión geográfica es clave para asignar la competencia territorial.',
      icons: [
        'https://img.freepik.com/vector-gratis/ilustracion-concepto-ubicacion-actual_114360-4406.jpg?ga=GA1.1.2090848934.1742857988&semt=ais_hybrid&w=740',
      ]
    },
    {
      heading: 'Número de caso',
      description: 'Una vez enviada la denuncia, recibirás un comprobante con un número de caso. Con él podrás consultar el estado de tu trámite en cualquier momento.',
      icons: [
        'https://img.freepik.com/vector-gratis/ilustracion-concepto-autenticacion-dos-factores_114360-5488.jpg?ga=GA1.1.2090848934.1742857988&semt=ais_hybrid&w=740',
      ]
    }
  ];

  constructor(
    private router: Router,
    private toastr: ToastrService,
    private botInfoService: BotInfoService,
    private location: Location
  ) { }

  ngOnInit(): void {
    // Para el Bot, exportamos solo los textos
    this.botInfoService.setInfoList(
      this.infoBlocks.map(b => `${b.heading}: ${b.description}`)
    );
    this.botInfoService.getScrollIndex().subscribe(i => this.scrollToParagraph(i));
  }

  scrollToParagraph(index: number): void {
    const elems = document.querySelectorAll('.info_item p');
    if (elems[index]) {
      (elems[index] as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  goToConsulta(): void {
    this.router.navigate(['/body/consultas']);
  }

 goToCrear(): void {
  // Ahora en vez de toastr, vamos directo a tipos:
  this.router.navigate(
    ['/body/tipos_de_denuncia'],
    { queryParams: { tipo: 'oficial' } }
  );
}


  private handleScrollUpVisibility(): void {
    const up = document.getElementById('scroll-up');
    if (!up) return;

    if (window.scrollY >= 560) {
      // Cuando hemos hecho scroll suficiente, lo mostramos
      up.classList.add('show-scroll');
      up.classList.remove('scrollup--inactive');
    } else {
      // Si volvemos arriba, lo ocultamos
      up.classList.remove('show-scroll');
      up.classList.add('scrollup--inactive');
    }
  }

  scrollToTop(): void {
    const step = -window.scrollY / 20;
    const iv = setInterval(() => {
      if (window.scrollY !== 0) window.scrollBy(0, step);
      else {
        clearInterval(iv);
        document.getElementById('scroll-up')?.classList.add('scrollup--inactive');
      }
    }, 16);
  }

  goBack(): void {
    this.location.back();
  }
}
