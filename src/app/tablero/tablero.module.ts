import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableroRoutes } from './tablero.routing';
import { RouterModule } from '@angular/router';
import { DemoMaterialModule } from '../demo-material-module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CifrasNotablesComponent } from './cifras-notables/cifras-notables.component';
import { SalesOverviewComponent } from '../dashboards/dashboard-components';
import { DashboardsModule } from '../dashboards/dashboards.module';
import { PerformanceGeneralLineasComponent } from './performance-general-lineas/performance-general-lineas.component';
import { ChartistModule } from 'ng-chartist';
import { ChartsModule } from 'ng2-charts';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { PerformanceGeneralRegionesComponent } from './performance-general-regiones/performance-general-regiones.component';
import { TablePerfMesVarComponent } from './componentsPerformance/table-perf-mes-var/table-perf-mes-var.component';
import { PerformanceTop5Component } from './performance-top5/performance-top5.component';
import { ComposicionVentasComponent } from './composicion-ventas/composicion-ventas.component';
import { MargenesBrutosLineasComponent } from './margenes-brutos-lineas/margenes-brutos-lineas.component';
import { MargenesBrutosRegionesComponent } from './margenes-brutos-regiones/margenes-brutos-regiones.component';
import { MargenesBrutosTop5Component } from './margenes-brutos-top5/margenes-brutos-top5.component';
import { ComposicionMargenesComponent } from './composicion-margenes/composicion-margenes.component';
import { GastoComponent } from './gasto/gasto.component';
import { APOLLO_OPTIONS } from 'apollo-angular';
import {InMemoryCache} from '@apollo/client/core';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';

import { HttpClient } from '@angular/common/http';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

import { ContribucionPortafolioComponent } from './contribucion-portafolio/contribucion-portafolio.component';
import { SpinnerComponent } from '../shared/spinner.component';

export function HttpLoaderFactory(http: HttpClient): any {
 // const urir = 'http://localhost:4200'
  const urir='https://app.banticanalytica.com'
  return new TranslateHttpLoader(http, urir+'/assets/i18n/', '.json');
}
@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(TableroRoutes),
    DemoMaterialModule,
    FlexLayoutModule,
    FormsModule,
    ReactiveFormsModule,
    DashboardsModule,
    ChartistModule,
    ChartsModule,
    NgxChartsModule,
    TranslateModule.forRoot({
      loader: {
          provide: TranslateLoader,
          useFactory: HttpLoaderFactory,
          deps: [HttpClient]
      }
  }),
],
declarations: [
    CifrasNotablesComponent,
    PerformanceGeneralLineasComponent,
    PerformanceGeneralLineasComponent,
    PerformanceGeneralRegionesComponent,
    TablePerfMesVarComponent,
    PerformanceTop5Component,
    ComposicionVentasComponent,
    MargenesBrutosLineasComponent,
    MargenesBrutosRegionesComponent,
    MargenesBrutosTop5Component,
    ComposicionMargenesComponent,
    GastoComponent,
    ContribucionPortafolioComponent
  ]
})
export class TableroModule { }
