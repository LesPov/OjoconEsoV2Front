import { Routes } from '@angular/router';

export const DenunciasRoutes: Routes = [
  { 
    path: 'body',
    loadComponent: () => import('../../anonimas/layout/body/body.component').then(m => m.BodyComponent),
    children: [
      {  
        path: 'inicioAnonima',
        loadComponent: () => import('../../anonimas/layout/inicio-anonima/inicio-anonima.component').then(m => m.InicioAnonimaComponent),
        data: { title: 'Denuncias Anónimas', componentName: 'inicioAnonima' }
      },
      { 
        path: 'consulta',
        loadComponent: () => import('../../anonimas/layout/consultas/consultas.component').then(m => m.ConsultasComponent),
      },
      {
        path: 'tipos_de_denuncia',
        loadComponent: () => import('../../anonimas/layout/tipo-de-denuncias/tipo-de-denuncias.component').then(m => m.TipoDeDenunciasComponent),
        data: { 
          title: 'Tipo de Denuncia', 
          componentName: 'tipo', 
        }
      },
      {
        path: 'subtipos_de_denuncia',
        loadComponent: () => import('../../anonimas/layout/subtipos-de-denuncias/subtipos-de-denuncias.component').then(m => m.SubtiposDeDenunciasComponent),
        data: { 
          title: 'Denuncias', 
          componentName: 'subtipos',
          tipoDenuncia: 'tipoDenuncia'
        }
      },
      {
        path: 'evidencia',
        loadComponent: () => import('../../anonimas/layout/evidencia/evidencia.component').then(m => m.EvidenciaComponent),
        data: { 
          title: 'Evidencia', 
          componentName: 'evidencia',
          tipoDenuncia: 'subtipoDenuncia'

        }
      },
      {
        path: 'ubicacion',
        loadComponent: () => import('../../anonimas/layout/ubicacion/ubicacion.component').then(m => m.UbicacionComponent),
        data: { 
          title: 'Ubicación', 
          componentName: 'ubicacion',
          tipoDenuncia: 'subtipoDenuncia'
        }
      },    
      {
        path: 'resumen',
        loadComponent: () => import('../../anonimas/layout/resumen/resumen.component').then(m => m.ResumenComponent),
        data: { 
          title: 'Resumen', 
          componentName: 'resumen',
          tipoDenuncia: 'subtipoDenuncia'
        }
      },
      {
        path: 'consultas',
        loadComponent: () => import('../../anonimas/layout/consultas/consultas.component').then(m => m.ConsultasComponent),
        data: { 
          title: 'Consulta tu Denuncia', 
          componentName: 'consultas'
        }
      },
      {
        path: '',
        redirectTo: 'inicioAnonima',
        pathMatch: 'full'
      }
    ]
  },
  
];
