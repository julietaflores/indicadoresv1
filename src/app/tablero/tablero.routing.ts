import { Routes } from '@angular/router';
import { CifrasNotablesComponent } from './cifras-notables/cifras-notables.component';
import { PerformanceGeneralLineasComponent } from './performance-general-lineas/performance-general-lineas.component';
import { FullComponent } from '../layouts/full/full.component';
import { PerformanceTop5Component } from './performance-top5/performance-top5.component';
import { PerformanceGeneralRegionesComponent } from './performance-general-regiones/performance-general-regiones.component';
import { ComposicionVentasComponent } from './composicion-ventas/composicion-ventas.component';
import { MargenesBrutosLineasComponent } from './margenes-brutos-lineas/margenes-brutos-lineas.component';
import { MargenesBrutosRegionesComponent } from './margenes-brutos-regiones/margenes-brutos-regiones.component';
import { ComposicionMargenesComponent } from './composicion-margenes/composicion-margenes.component';
import { MargenesBrutosTop5Component } from './margenes-brutos-top5/margenes-brutos-top5.component';

export const TableroRoutes: Routes = [
  /*  {
        path: '',
     //   component: CifrasNotablesComponent,

      children: [
            {
                path: 'Cifras_Notables',
                component: CifrasNotablesComponent,
                data: {
                    title: 'Cifras Notables',
                    urls: [
                        { title: 'Dashboard', url: '/dashboard' },
                        { title: 'Cifras Notables' }
                    ]
                },

             
            },
            {
                path: '',
                component: PerformanceGeneralLineasComponent,
                data: {
                    title: 'Performance general (líneas)',
                    urls: [
                        { title: 'Dashboard', url: '/dashboard' },
                        { title: 'Performance general (líneas)' }
                    ]
                },
                
             
            }
        ]
    }*/
    {
        path: '',
        component: CifrasNotablesComponent
     
      },
    {
        path: 'Cifras_Notables',
        component: CifrasNotablesComponent,
        data: {
            title: 'Cifras Notables',
            urls: [
                { title: 'Dashboard', url: '/dashboard' },
                { title: 'Cifras Notables' }
            ]
        }
     
    },
    {
        path: 'Performance_lineasGenerales',
        component: PerformanceGeneralLineasComponent,
        data: {
            title: 'Performance Lineas Generales',
            urls: [
                { title: 'Dashboard', url: '/dashboard' },
                { title: 'Performance Lineas Generales' }
            ]
        }
     
    },
    {
        path: 'Performance_general_(Regiones)',
        component: PerformanceGeneralRegionesComponent,
        data: {
            title: 'Performance general (Regiones)',
            urls: [
                { title: 'Dashboard', url: '/dashboard' },
                { title: 'Performance general (Regiones)' }
            ]
        }
     
    },
    {
        path: 'Performance_top5',
        component: PerformanceTop5Component,
        data: {
            title: 'Performance Top 5 +',
            urls: [
                { title: 'Dashboard', url: '/dashboard' },
                { title: 'Performance Top 5 +' }
            ]
        }
     
    },{
        path: 'Composición_de_ventas',
        component: ComposicionVentasComponent,
        data: {
            title: 'Composicion de Ventas',
            urls: [
                { title: 'Dashboard', url: '/dashboard' },
                { title: 'Composicion de Ventas' }
            ]
        }
        
    },
    {
        path: 'Margen_bruto_regiones',
        component: MargenesBrutosRegionesComponent,
        data: {
            title: 'Margen brutos (Regiones)',
            urls: [
                { title: 'Dashboard', url: '/dashboard' },
                { title: 'Margen brutos (Regiones)' }
            ]
        }
        
    },
    {
        path: 'Margen_bruto_top5+',
        component: MargenesBrutosTop5Component,
        data: {
            title: 'Margen brutos (Top5+)',
            urls: [
                { title: 'Dashboard', url: '/dashboard' },
                { title: 'Margen brutos (Top5+)' }
            ]
        }
        
    },
    {
        path: 'Composicion_de_margenes',
        component: ComposicionMargenesComponent,
        data: {
            title: 'Composición de Margenes',
            urls: [
                { title: 'Dashboard', url: '/dashboard' },
                { title: 'Composición de Margenes' }
            ]
        }
        
    },
    
//{ path: '', component: PerformanceGeneralLineasComponent },
];
