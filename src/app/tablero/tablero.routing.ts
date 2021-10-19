import { ROUTES, Routes } from '@angular/router';
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
import { MargenesBrutosRegionesAuxiliarComponent } from './margenes-brutos-regiones-auxiliar/margenes-brutos-regiones-auxiliar.component';
import { ContribucionPortafolioComponent } from './contribucion-portafolio/contribucion-portafolio.component';



export const TableroRoutes: Routes = [


    {
        path: 'Cifras_Notables',
        component: CifrasNotablesComponent,
        data: { title: 'Indicadores' }
    },
    {
        path: 'Performance_general_lineas',
        component: PerformanceGeneralLineasComponent,
        data: { title: 'Indicadores' }
    },

    {
        path: 'Performance_general_Regiones',
        component: PerformanceGeneralRegionesComponent,
        data: { title: 'Indicadores' }
    },

    {
        path: 'Performance_top5',
        component: PerformanceTop5Component,
        data: { title: 'Indicadores' }
    },
    {
        path: 'Composición_de_ventas',
        component: ComposicionVentasComponent,
        data: { title: 'Indicadores' }
    },
    {
        path: 'Margen_bruto_regiones',
        component: MargenesBrutosRegionesComponent,
        data: { title: 'Indicadores' }

    },
    {
        path: 'Margen_bruto_lineal',
        component: MargenesBrutosLineasComponent,
        data: { title: 'Indicadores' }

    },
    {
        path: 'Margen_bruto_top5+',
        component: MargenesBrutosTop5Component,
        data: { title: 'Indicadores' }
    },
    {
        path: 'Composicion_de_margenes',
        component: ComposicionMargenesComponent,
        data: { title: 'Indicadores' }
     },
     {
        path: 'Contribución_del_portafolio',
        component: ContribucionPortafolioComponent,
        data: { title: 'Indicadores' }
     }



    // data: {
    //     title: 'julieta [indicator]'
    //     // urls: [
    //     //    // { title: 'Dashboard', url: '/dashboard' },
    //     //     { title: 'p' }
    //     // ]
    // }
    // path: '/:indicator',
    // component: CifrasNotablesComponent
    //     },
    // {    path: 'Cifras_Notables',
    //     component: CifrasNotablesComponent,
    //     // data: {
    //     //     title: 'Cifras Notables',
    //     //     urls: [
    //     //         { title: 'Dashboard', url: '/dashboard' },
    //     //         { title: 'Cifras Notables' }
    //     //     ]
    //     // }
    // }
    //   },
 
];
