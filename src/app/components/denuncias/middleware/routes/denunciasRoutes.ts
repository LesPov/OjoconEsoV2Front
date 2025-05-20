import { Routes } from '@angular/router';

export const DenunciasRoutes: Routes = [
  {
    path: 'body',
    loadComponent: () => import('../../anonimas/layout/body/body.component').then(m => m.BodyComponent),
    children: [
      //SECCION ANONIMAS 
      {
        path: 'inicioAnonima',
        loadComponent: () => import('../../anonimas/layout/inicio-anonima/inicio-anonima.component').then(m => m.InicioAnonimaComponent),
        data: { title: 'Denuncias Anónimas', componentName: 'inicioAnonima' }
      },
      // Sección oficial
      {
        path: 'oficial',
        loadComponent: () => import('../../oficial/layout/inicio-oficial/inicio-oficial.component')
          .then(m => m.InicioOficialComponent),
        data: {
          title: 'Denuncias Oficiales',
          componentName: 'inicioOficial'
        }
      },
      {
        path: 'registroResidenciaIncidente',
        loadComponent: () => import('../../oficial/layout/registro-recidencia-oficial/registro-recidencia-oficial.component').then(m => m.RegistroRecidenciaOficialComponent),
        data: {
          title: 'Residencia Oficial',
          componentName: 'registroResidenciaIncidente',
        },
      },
      //APARECE E NANONIMAS Y OFICIALES 

      {
        path: 'tipos_de_denuncia',
        loadComponent: () => import('../../anonimas/layout/tipo-de-denuncias/tipo-de-denuncias.component').then(m => m.TipoDeDenunciasComponent),
        data: {
          title: 'Tipo de Denuncia',
          componentName: 'tipo',
        }
      },
      //APARECE E NANONIMAS Y OFICIALES 

      {
        path: 'subtipos_de_denuncia',
        loadComponent: () => import('../../anonimas/layout/subtipos-de-denuncias/subtipos-de-denuncias.component').then(m => m.SubtiposDeDenunciasComponent),
        data: {
          title: 'Subtipos de Denuncias',
          componentName: 'subtipos',
          tipoDenuncia: 'tipoDenuncia'
        }
      },
      //APARECE E NANONIMAS Y OFICIALES 

      {
        path: 'evidencia',
        loadComponent: () => import('../../anonimas/layout/evidencia/evidencia.component').then(m => m.EvidenciaComponent),
        data: {
          title: 'Evidencia',
          componentName: 'evidencia',
          tipoDenuncia: 'subtipoDenuncia'

        }
      },
      //APARECE E NANONIMAS Y OFICIALES 
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
        path: 'registroOficial',
        loadComponent: () => import('../../oficial/layout/registro-oficial/registro-oficial.component').then(m => m.RegistroOficialComponent),
        data: {
          title: 'Registro Oficial',
          componentName: 'registroOficial',
        }
      },
      //RESUMEN ANONIMA 
      {
        path: 'resumen',
        loadComponent: () => import('../../anonimas/layout/resumen/resumen.component').then(m => m.ResumenComponent),
        data: {
          title: 'Resumen',
          componentName: 'resumen',
          tipoDenuncia: 'subtipoDenuncia'
        }
      },
      //RESUMEN ANONIMA 
      {
        path: 'resumenOficial',
        loadComponent: () => import('../../oficial/layout/resumen-oficial/resumen-oficial.component').then(m => m.ResumenOficialComponent),
        data: {
          title: 'Resumen Oficial',
          componentName: 'resumenOficial',
          tipoDenuncia: 'resumenOficial'
        }
      },
      //CONSULTA PARA ANONIMAS Y OFICIALES 
      {
        path: 'consultas',
        loadComponent: () => import('../../anonimas/layout/consultas/consultas.component').then(m => m.ConsultasComponent),
        data: {
          title: 'Consulta tu Denuncia',
          componentName: 'consultas'
        }
      },
         {
        path: 'consultasOficial',
        loadComponent: () => import('../../oficial/layout/consulta-oficial/consulta-oficial.component').then(m => m.ConsultaOficialComponent),
        data: {
          title: 'Consulta tu Denuncia Oficial',
          componentName: 'consultasOficial'
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
