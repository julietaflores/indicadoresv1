import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Apollo, QueryRef } from 'apollo-angular';
import gql from 'graphql-tag';
import { UserService } from 'src/app/services/user.service';
import { Label } from 'ng2-charts';
import * as pluginDataLabels from 'chartjs-plugin-datalabels';
import { Subscription } from 'rxjs';
import { ChartOptions } from 'chart.js';

const QIMBTOP5 = gql`
query margenbruto_top5($idrol1:Int!,$anioo:Int!,$mess:String,$companiaa:Int!, $monedadestinoo:Int!) {
  margenbruto_top5(idrol1:$idrol1,anioo:$anioo,mess:$mess,companiaa:$companiaa, monedadestinoo:$monedadestinoo){
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
  selector: 'app-margenes-brutos-top5',
  templateUrl: './margenes-brutos-top5.component.html',
  styleUrls: ['./margenes-brutos-top5.component.scss']
})
export class MargenesBrutosTop5Component implements OnInit, OnDestroy {
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

  private queryMesRegion: Subscription;//get first list products

  listamesMB: MargenBruto[] = [];
  listyearVAR: MargenBruto[] = [];

  // This is line chart
  // bar chart
 
  public barChartOptions: any = {
    scales: { xAxes: [{}], yAxes: [{}] },
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      datalabels: {
        color: '#ffffff',
        align: 'end',
        display: true,
        borderWidth: 6600,
        precision: 2
        
      },
      labels:{
        render: 'value'
      }
  }
  };


  public barChartLabels: string[] = [

  ];
  public barChartType = 'horizontalBar';
  public barChartLegend = true;

  public barChartData: any[]= [];
  public barChartDataAc: any[]=[];

  public barChartColors: Array<any> = [

  ];

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
        query: QIMBTOP5,
        variables: {
          idrol1: this.userservice.responseLogin.idUsuario,
          anioo: new Date().getFullYear(),
          mess: this.getCurrenlyMonth(),
          companiaa: this.userservice.responseLogin.companiaa[0].idCompaniaOdoo,
          monedadestinoo: this.userservice.responseLogin.companiaa[0].idMonedaEmpresaOdoo
        }
      }).valueChanges.subscribe((result: any) => {

        if (result.data.margenbruto_top5.lista_mes && result.data.margenbruto_top5.lista_anual) {
          let listabar: any = [];
          let listabarAc:any=[];
          this.barChartData = [];
          this.barChartDataAc=[];
          this.barChartLabels = [];
          this.listamesMB = [];
          this.listyearVAR = [];

          let listames = result.data.margenbruto_top5.lista_mes;
          let listaanual = result.data.margenbruto_top5.lista_anual;
          this.dataSourceMes = new MatTableDataSource<MargenBruto>();
          this.dataSourceAcumulado = new MatTableDataSource<MargenBruto>();

          listames.forEach((value: any) => {
            let item = {
              producto: value.nombre,
              porcentaje_margen: value.porcentaje_margen_actual,
              bps: value.bPS,
              moneda: value.importe_actual
            }

            this.listamesMB.push(item);
            listabar.push(value.porcentaje_margen_actual);
            this.barChartLabels.push(value.nombre);
          });
          listaanual.forEach((value: any) => {
            let item = {
              producto: value.nombre,
              porcentaje_margen: value.porcentaje_margen_actual,
              bps: value.bPS,
              moneda: value.importe_actual
            }
            this.listyearVAR.push(item);
            listabarAc.push(value.porcentaje_margen_actual);
          });

          this.dataSourceMes = new MatTableDataSource<MargenBruto>(this.listamesMB);
         
        
          this.barChartColors.push({ backgroundColor: '#1976d2' });

          this.barChartData[0] = {
            data: listabar,
            label: 'VAR. vs.' + (new Date().getFullYear() - 1)
          }
          this.barChartDataAc[0]={
            data: listabarAc,
            label: 'VAR. vs.' + (new Date().getFullYear() - 1)
          }
          this.dataSourceAcumulado = new MatTableDataSource<MargenBruto>(this.listyearVAR);

        }

      });

    }
  }

  displayedColumns = ['producto', 'porcentaje_margen', 'bps', 'importe_actual'];
  dataSourceMes = new MatTableDataSource<MargenBruto>();
  dataSourceAcumulado = new MatTableDataSource<MargenBruto>();

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
  getAbsoluto(value:number){
    return Math.abs(value);
  }
  refreshQuery() {
    if (this.userservice.responseLogin) {

      let arraymonedas = this.userservice.responseLogin.monedass;
      this.selectedCoinTable = arraymonedas.find((e: any) => e.idMonedaEmpresaOdoo ==
        this.selectedCoin).name

      this.queryMesRegion = this.apollo.watchQuery({
        query: QIMBTOP5,
        variables: {
          idrol1: this.userservice.responseLogin.idUsuario,
          anioo: Number(this.selectedyear),
          mess: this.selectedMonth,
          companiaa: this.userservice.responseLogin.companiaa[0].idCompaniaOdoo,
          monedadestinoo: this.selectedCoin
        }
      }).valueChanges.subscribe((result: any) => {
        console.log(result);
        if (result.data.margenbruto_top5.lista_mes && result.data.margenbruto_top5.lista_anual) {
          let listabar: any = [];
          this.barChartLabels = [];
          this.barChartData = [];
          this.barChartLabels = [];
          this.listamesMB = [];
          this.listyearVAR = [];
          let listames = result.data.margenbruto_top5.lista_mes;
          let listaanual = result.data.margenbruto_top5.lista_anual;
          this.dataSourceMes = new MatTableDataSource<MargenBruto>();
          this.dataSourceAcumulado = new MatTableDataSource<MargenBruto>();
          listames.forEach((value: any) => {
            let item = {
              producto: value.nombre,
              porcentaje_margen: value.porcentaje_margen_actual,
              bps: value.bPS,
              moneda: value.importe_actual
            }
  
            this.listamesMB.push(item);
            listabar.push(value.porcentaje_margen_actual);
            this.barChartLabels.push(value.nombre);
          });
          listaanual.forEach((value: any) => {
            let item = {
              producto: value.nombre,
              porcentaje_margen: value.porcentaje_margen_actual,
              bps: value.bPS,
              moneda: value.importe_actual
            }
            this.listyearVAR.push(item);
          });
  
          this.dataSourceMes = new MatTableDataSource<MargenBruto>(this.listamesMB);
  
          this.barChartColors.push({ backgroundColor: '#1976d2' });
  
          this.barChartData[0] = {
            data: listabar,
            label: 'VAR. vs.' + (new Date().getFullYear() - 1)
          }
          this.dataSourceAcumulado = new MatTableDataSource<MargenBruto>(this.listyearVAR);
  
        }
     
      });
    }
  }

  ngOnDestroy(): void {
    this.queryMesRegion.unsubscribe();

  }

}

export interface MargenBruto {
  producto: string;
  porcentaje_margen: string;
  bps: string;
  moneda: number;
}