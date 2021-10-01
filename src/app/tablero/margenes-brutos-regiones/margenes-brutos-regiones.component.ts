import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Apollo, QueryRef } from 'apollo-angular';
import gql from 'graphql-tag';
import { UserService } from 'src/app/services/user.service';
import { Label } from 'ng2-charts';
import * as pluginDataLabels from 'chartjs-plugin-datalabels';
import { Subscription } from 'rxjs';
const QIMBREGION = gql`
query margenbruto_region($idrol1:Int!,$anioo:Int!,$mess:String,$companiaa:Int!, $monedadestinoo:Int!) {
  margenbruto_region(idrol1:$idrol1,anioo:$anioo,mess:$mess,companiaa:$companiaa, monedadestinoo:$monedadestinoo){
    tablero{
      idTablero
      nombreTablero
      estadoTablero
      urlTablero
      idCategoria
      
    }
    lista_mes{
      id
      nombre
      importe_actual
      coste_actual
      porcentaje_margen_actual
      importe_anterior
      coste_anterior
      porcentaje_margen_anterior
      bPS
      calculo_grafico
      porcentajetorta
    }
    
      lista_anual{
      id
      nombre
      importe_actual
      coste_actual
      porcentaje_margen_actual
      importe_anterior
      coste_anterior
      porcentaje_margen_anterior
      bPS
      calculo_grafico
      porcentajetorta
    }
  } 
}
`;

@Component({
  selector: 'app-margenes-brutos-regiones',
  templateUrl: './margenes-brutos-regiones.component.html',
  styleUrls: ['./margenes-brutos-regiones.component.scss']
})
export class MargenesBrutosRegionesComponent implements OnInit, OnDestroy {


  coins: any[] = [];
  years: any[] = [
    { value: '2021', viewValue: '2021' },
    { value: '2020', viewValue: '2020' },
    { value: '2019', viewValue: '2019' },
    { value: '2018', viewValue: '2018' },
    { value: '2017', viewValue: '2017' },
    { value: '2016', viewValue: '2016' }
  ];
  months: any[] = [
    { value: '01', viewValue: 'Enero' },
    { value: '02', viewValue: 'Febrero' },
    { value: '03', viewValue: 'Marzo' },
    { value: '04', viewValue: 'Abril' },
    { value: '05', viewValue: 'Mayo' },
    { value: '06', viewValue: 'Junio' },
    { value: '07', viewValue: 'Julio' },
    { value: '08', viewValue: 'Agosto' },
    { value: '09', viewValue: 'Septiembre' },
    { value: '10', viewValue: 'Octubre' },
    { value: '11', viewValue: 'Noviembre' },
    { value: '12', viewValue: 'Marzo' }
  ];

  // This is line chart
  // bar chart
  public barChartOptions: any = {
    scaleShowVerticalLines: false,
    responsive: true,

    plugins: {
      datalabels: {
        color: '#ffffff',
        formatter: function (value: any) {
          return Number.parseFloat(value).toFixed(2);
        },
      }
    }
  };

  public barChartLabels: string[] = [

  ];
  public barChartType = 'horizontalBar';
  public barChartLegend = true;

  public barChartData: any[] = [

  ];
  public barChartColors: Array<any> = [

  ];
  displayedColumns = ['division', 'porcentaje_margen', 'bps', 'importe_actual'];

  listamesMB: MargenBrutoRegion[] = [];
  listyearVAR: MargenBrutoRegion[] = [];

  dataSourceMes = new MatTableDataSource<MargenBrutoRegion>();
  dataSourceAcumulado = new MatTableDataSource<MargenBrutoRegion>();


  queryMesRegion: Subscription;//get first list products

  selectedyear = String(new Date().getFullYear());
  selectedMonth = String(this.getCurrenlyMonth());
  MesActual: any = this.getCurrenlyMonth();
  selectedCoin = 0;
  selectedCoinTable: String = '';//Variable en table

  constructor(public userservice: UserService,
    private apollo: Apollo) {
    this.queryMesRegion = new Subscription();
  }

  ngOnInit(): void {
    if (this.userservice.responseLogin) {
      this.selectedCoin = this.userservice.responseLogin.companiaa[0].idMonedaEmpresaOdoo;
      let arraymonedas = this.userservice.responseLogin.monedass;
      this.selectedCoinTable = arraymonedas.find((e: any) => e.idMonedaEmpresaOdoo ==
        this.userservice.responseLogin.companiaa[0].idMonedaEmpresaOdoo).name;

      arraymonedas.forEach((e: any) => {
        let coin = {
          value: e.idMonedaEmpresaOdoo,
          viewValue: e.name
        };
        this.coins.push(coin);
      });

      this.queryMesRegion = this.apollo.watchQuery({
        query: QIMBREGION,
        variables: {
          idrol1: this.userservice.responseLogin.idUsuario,
          anioo: new Date().getFullYear(),
          mess: this.getCurrenlyMonth(),
          companiaa: this.userservice.responseLogin.companiaa[0].idCompaniaOdoo,
          monedadestinoo: this.userservice.responseLogin.companiaa[0].idMonedaEmpresaOdoo
        },
        pollInterval: 5000
      }).valueChanges.subscribe((result: any) => {
        if (result.data.margenbruto_region.lista_mes && result.data.margenbruto_region.lista_anual) {
          let listabar: any = [];
          this.barChartData = [];
          this.barChartLabels = [];
          this.listamesMB = [];
          this.listyearVAR = [];
          this.dataSourceMes = new MatTableDataSource<MargenBrutoRegion>();
          this.dataSourceAcumulado = new MatTableDataSource<MargenBrutoRegion>();
          let listames = result.data.margenbruto_region.lista_mes;
          let listaanual = result.data.margenbruto_region.lista_anual;

          listames.forEach((value: any) => {
            let item = {
              division: value.nombre,
              porcentaje_margen: value.porcentaje_margen_actual,
              bps: value.bPS,
              moneda: value.importe_actual
            }
            listabar.push(value.porcentaje_margen_actual);
            this.listamesMB.push(item);
            this.barChartLabels.push(value.nombre);

          });
          listaanual.forEach((value: any) => {
            let item = {
              division: value.nombre,
              porcentaje_margen: value.porcentaje_margen_actual,
              bps: value.bPS,
              moneda: value.importe_actual
            }
            this.listyearVAR.push(item);
          });
          this.dataSourceAcumulado = new MatTableDataSource<MargenBrutoRegion>(this.listyearVAR);

          this.barChartColors.push({ backgroundColor: '#1976d2' });
          this.barChartData[0] = {
            data: listabar,
            label: 'VAR. vs.' + (new Date().getFullYear() - 1)
          }
          this.dataSourceMes = new MatTableDataSource<MargenBrutoRegion>(this.listamesMB);

        }


      });

    }
  }

  public chartHovered(e: any): void {
    // console.log(e);
  }
  // events
  public chartClicked(e: any): void {
    // console.log(e);
  }
  getCurrenlyMonth() {
    let month = new Date().getMonth() + 1;
    if (month < 10) {
      return "0" + month;
    }
    else {
      return month;
    }
  }
  onYearChange(event: any) {
    this.refreshQuery();
  }
  onMonthChange(event: any) {
    this.refreshQuery();
  }
  onCoinChange(event: any) {
    this.refreshQuery();
  }
  ngOnDestroy() {
    this.queryMesRegion.unsubscribe()
  }
  getAbsoluto(value:number){
    return Math.abs(value);
  }
  private refreshQuery() {
    if (this.userservice.responseLogin) {
      this.barChartLabels = [];
      let arraymonedas = this.userservice.responseLogin.monedass;
      this.selectedCoinTable = arraymonedas.find((e: any) => e.idMonedaEmpresaOdoo ==
        this.selectedCoin).name
      this.queryMesRegion = this.apollo.watchQuery({
        query: QIMBREGION,
        variables: {
          idrol1: this.userservice.responseLogin.idUsuario,
          anioo: Number(this.selectedyear),
          mess: this.selectedMonth,
          companiaa: this.userservice.responseLogin.companiaa[0].idCompaniaOdoo,
          monedadestinoo: this.selectedCoin
        },
        pollInterval: 5000
      }).valueChanges.subscribe((result: any) => {
        if (result.data.margenbruto_region.lista_mes && result.data.margenbruto_region.lista_anual) {
          let listabar: any = [];
          this.barChartData = [];
          this.barChartLabels = [];
          this.listamesMB = [];
          this.listyearVAR = [];
          this.dataSourceMes = new MatTableDataSource<MargenBrutoRegion>();
          this.dataSourceAcumulado = new MatTableDataSource<MargenBrutoRegion>();
          let listames = result.data.margenbruto_region.lista_mes;
          let listaanual = result.data.margenbruto_region.lista_anual;
          listames.forEach((value: any) => {
            let item = {
              division: value.nombre,
              porcentaje_margen: value.porcentaje_margen_actual,
              bps: value.bPS,
              moneda: value.importe_actual
            }
            listabar.push(value.porcentaje_margen_actual);
            this.listamesMB.push(item);
            this.barChartLabels.push(value.nombre);

          });
          listaanual.forEach((value: any) => {
            let item = {
              division: value.nombre,
              porcentaje_margen: value.porcentaje_margen_actual,
              bps: value.bPS,
              moneda: value.importe_actual
            }
            this.listyearVAR.push(item);
          });
          this.dataSourceAcumulado = new MatTableDataSource<MargenBrutoRegion>(this.listyearVAR);

          this.barChartColors.push({ backgroundColor: '#1976d2' });
          this.barChartData[0] = {
            data: listabar,
            label: 'VAR. vs.' + (new Date().getFullYear() - 1)
          }
          this.dataSourceMes = new MatTableDataSource<MargenBrutoRegion>(this.listamesMB);

        }


      });
    }
  }

}

export interface MargenBrutoRegion {
  division: string;
  porcentaje_margen: string;
  bps: string;
  moneda: number;
}


