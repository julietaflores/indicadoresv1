import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Apollo, QueryRef } from 'apollo-angular';
import gql from 'graphql-tag';
import { UserService } from 'src/app/services/user.service';
import { Label } from 'ng2-charts';
import * as pluginDataLabels from 'chartjs-plugin-datalabels';
const QIMBMES = gql`
query margenbruto_regionmes($idrol1:Int!,$anioo:Int!,$mess:String,$companiaa:Int!, $monedadestinoo:Int!) {
  margenbruto_regionmes(idrol1:$idrol1,anioo:$anioo,mess:$mess,companiaa:$companiaa, monedadestinoo:$monedadestinoo){
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
query margenbruto_regionanual($idrol1:Int!,$anioo:Int!,$mess:String,$companiaa:Int!, $monedadestinoo:Int!) {
  margenbruto_regionanual(idrol1:$idrol1,anioo:$anioo,mess:$mess,companiaa:$companiaa, monedadestinoo:$monedadestinoo){
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
  selector: 'app-margenes-brutos-regiones',
  templateUrl: './margenes-brutos-regiones.component.html',
  styleUrls: ['./margenes-brutos-regiones.component.scss']
})
export class MargenesBrutosRegionesComponent implements OnInit {


  // This is line chart
  // bar chart
  public barChartOptions: any = {
    scaleShowVerticalLines: false,
    responsive: true,
    barThickness: 10
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


  queryMesRegion: any;//get first list products
  queryAnualRegion: any;//get first list products

  constructor(public userservice: UserService,
    private apollo: Apollo) { }

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
        let listabar:any=[];
        let listames = result.data.margenbruto_regionmes.lista;
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
        this.barChartColors.push( { backgroundColor: '#1976d2' });
        this.barChartData[0]={
          data:listabar,
          label:"procentaje"
        }
        this.dataSourceMes = new MatTableDataSource<MargenBrutoRegion>(this.listamesMB);

        this.queryAnualRegion = this.apollo.watchQuery({
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
          let listaanual = result.data.margenbruto_regionanual.lista;
          listaanual.forEach((value: any) => {
            let item = {
              division: value.nombre,
              porcentaje_margen: value.porcentaje_margen_actual,
              bps: value.bPS,
              moneda: value.importe_actual
            }
            this.listyearVAR.push(item);
          });
          this.dataSourceAcumulado= new MatTableDataSource<MargenBrutoRegion>(this.listyearVAR);
        });
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

}

export interface MargenBrutoRegion {
  division: string;
  porcentaje_margen: string;
  bps: string;
  moneda: number;
}


