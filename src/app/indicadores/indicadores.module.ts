import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { IndicadoresRoutes } from './indicadores.routing';
import { DemoMaterialModule } from '../demo-material-module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DashboardsModule } from '../dashboards/dashboards.module';
import { VentasComponent } from './ventas/ventas.component';
import { VolumenComponent } from './volumen/volumen.component';
import { PrecioPromedioComponent } from './precio-promedio/precio-promedio.component';
import { GrossMarginComponent } from './gross-margin/gross-margin.component';
import { GrossProfitComponent } from './gross-profit/gross-profit.component';



@NgModule({
  
  imports: [
    CommonModule,
    RouterModule.forChild(IndicadoresRoutes),
    DemoMaterialModule,
    FlexLayoutModule,
    FormsModule,
    ReactiveFormsModule,
    DashboardsModule
   ],
   declarations: [
     VentasComponent,
     VolumenComponent,
     PrecioPromedioComponent,
     GrossMarginComponent,
     GrossProfitComponent
   ]
})
export class IndicadoresModule { }
