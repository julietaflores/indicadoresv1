import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Apollo } from 'apollo-angular';
import { UserService } from 'src/app/services/user.service';
import gql from 'graphql-tag';
import { Label } from 'ng2-charts';
import * as pluginDataLabels from 'chartjs-plugin-datalabels';
import { Subscription } from 'rxjs';

const QIMBMES = gql`
query margenbruto_top5mes($idrol1:Int!,$anioo:Int!,$mess:String,$companiaa:Int!, $monedadestinoo:Int!) {
  margenbruto_top5mes(idrol1:$idrol1,anioo:$anioo,mess:$mess,companiaa:$companiaa, monedadestinoo:$monedadestinoo){
    tablero{
      idTablero
      nombreTablero
      estadoTablero
      urlTablero
      idCategoria
      
    }
    lista{
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
const QIMBANUAL = gql`
query margenbruto_top5anual($idrol1:Int!,$anioo:Int!,$mess:String,$companiaa:Int!, $monedadestinoo:Int!) {
  margenbruto_top5anual(idrol1:$idrol1,anioo:$anioo,mess:$mess,companiaa:$companiaa, monedadestinoo:$monedadestinoo){
    tablero{
      idTablero
      nombreTablero
      estadoTablero
      urlTablero
      idCategoria
      
    }
    lista{
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
  private queryMesRegion: any;//get first list products
  private queryAnualRegion: any;//get first list products
  listamesMB: MargenBruto[] = [];
  listyearVAR: MargenBruto[] = [];

  constructor(public userservice: UserService,
    private apollo: Apollo) {
    this.queryMesRegion = new Subscription();
    this.queryAnualRegion = new Subscription();
  }
  ngOnDestroy(): void {
    // this.queryMesRegion.unsubscribe();
    // this.queryAnualRegion.unsubscribe();
  }

  ngOnInit(): void {
    if (this.userservice.responseLogin) {

      this.queryMesRegion = this.apollo.watchQuery({
        query: QIMBMES,
        variables: {
          idrol1: this.userservice.responseLogin.idUsuario,
          anioo: new Date().getFullYear(),
          mess: "0" + new Date().getMonth(),
          companiaa: this.userservice.responseLogin.companiaa[0].idCompaniaOdoo,
          monedadestinoo: this.userservice.responseLogin.companiaa[0].idMonedaEmpresaOdoo
        }
      });
      this.queryMesRegion.valueChanges.subscribe((result: any) => {
        console.log(result.data.margenbruto_regionmes);
        let listBarPercentaje: any[] = [];
        let listames = result.data.margenbruto_top5mes.lista;
        listames.forEach((value: any) => {
          let item = {
            producto: value.nombre,
            porcentaje_margen: value.porcentaje_margen_actual,
            bps: value.bPS,
            moneda: value.importe_actual
          }
          this.listamesMB.push(item);
        });
        this.dataSourceMes = new MatTableDataSource<MargenBruto>(this.listamesMB);

        this.queryAnualRegion = this.apollo.watchQuery<any>({
          query: QIMBANUAL,
          variables: {
            idrol1: this.userservice.responseLogin.idUsuario,
            anioo: new Date().getFullYear(),
            mess: "0" + new Date().getMonth(),
            companiaa: this.userservice.responseLogin.companiaa[0].idCompaniaOdoo,
            monedadestinoo: this.userservice.responseLogin.companiaa[0].idMonedaEmpresaOdoo
          }
        });
        this.queryAnualRegion.valueChanges.subscribe((result: any) => {
          let listaanual = result.data.margenbruto_top5anual.lista;
          listaanual.forEach((value: any) => {
            let item = {
              producto: value.nombre,
              porcentaje_margen: value.porcentaje_margen_actual,
              bps: value.bPS,
              moneda: value.importe_actual
            }
            this.listyearVAR.push(item);
          });
          this.dataSourceAcumulado = new MatTableDataSource<MargenBruto>(this.listyearVAR);
        });
      });

    }
  }
  // This is line chart
  // bar chart
  public barChartOptions: any = {
    scaleShowVerticalLines: false,
    responsive: true,
    barThickness: 10
  };

  public barChartLabels: string[] = [];
  public barChartType = 'horizontalBar';
  public barChartLegend = true;

  public barChartData: any[] = [
    { data: [65, 59, 80, 81, 56, 55, 40], label: 'Iphone 8' },
    { data: [28, 48, 40, 19, 86, 27, 90], label: 'Iphone X' }
  ];
  public barChartColors: Array<any> = [
    { backgroundColor: '#1976d2' },
    { backgroundColor: '#26dad2' }
  ];
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

}

export interface MargenBruto {
  producto: string;
  porcentaje_margen: string;
  bps: string;
  moneda: number;
}