import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Apollo, QueryRef } from 'apollo-angular';
import { ChartDataSets, ChartOptions, ChartType } from 'chart.js';
import gql from 'graphql-tag';
import { Label, SingleDataSet } from 'ng2-charts';
import { UserService } from 'src/app/services/user.service';
import * as pluginDataLabels from 'chartjs-plugin-datalabels';
import { NEVER } from 'rxjs';
import { switchMap } from 'rxjs/operators';

const QIVARS = gql`
query raking_lista_mesanual_region($idrol1:Int!,$anioo:Int!,$mess:String,$companiaa:Int!, $monedadestinoo:Int!,
  $ciudadid:Int!) {
    raking_lista_mesanual_region(idrol1:$idrol1,anioo:$anioo,mess:$mess,companiaa:$companiaa,
     monedadestinoo:$monedadestinoo,ciudadid:$ciudadid){
      lista{
        idIndicador
        nombreIndicador
        monto_Mes
        porcentaje_Monto_Mes
        monto_Acumulado
        porcentaje_Monto_Acumulado
        vs
      }
  } 
}
`;
const QIPTMES = gql`
query performanceregionmes($idrol1:Int!,$anioo:Int!,$mess:String,$companiaa:Int!, $monedadestinoo:Int!) {
  performanceregionmes(idrol1:$idrol1,anioo:$anioo,mess:$mess,companiaa:$companiaa, monedadestinoo:$monedadestinoo){
    tablero{
      idTablero
      nombreTablero
      estadoTablero
      urlTablero
      idCategoria
    }
    lista{
      idPosicion
      nombre
      importeactual
      importeanterior
      porcentajetorta
    }
  } 
}
`;
const LOGIN = gql`
  query validarlogin($usuario:String,$clave:String) {
    validarlogin(usuario: $usuario, clave: $clave) {
      idUsuario
      nombreUsuario
      usuario
      iDRolUsuario
      codIdioma
      monedass{
        idMonedaEmpresaOdoo
        name
        symbol
        rate
        estado
      }
      companiaa{
        idCompaniaOdoo
        name
        idMonedaEmpresaOdoo
        estado
    }
  
    }
  }
  `;
const QIPACUMULADO = gql`
  query performanceregionanual($idrol1:Int!,$anioo:Int!,$mess:String,$companiaa:Int!, $monedadestinoo:Int!) {
    performanceregionanual(idrol1:$idrol1,anioo:$anioo,mess:$mess,companiaa:$companiaa, monedadestinoo:$monedadestinoo){
      tablero{
        idTablero
        nombreTablero
        estadoTablero
        urlTablero
        idCategoria
      }
      lista{
        idPosicion
        nombre
        importeactual
        importeanterior
        porcentajetorta
        
      }
    } 
  }
  `;
@Component({
  selector: 'app-performance-general-regiones',
  templateUrl: './performance-general-regiones.component.html',
  styleUrls: ['./performance-general-regiones.component.scss']
})
export class PerformanceGeneralRegionesComponent implements OnInit {

  //queries for GraphQL
  queryMes: any;//get first list products
  queryMesVars: any;//query list for each product
  queryYear: any;
  queryYearVariacion: any;

  selectedyear = String(new Date().getFullYear());
  selectedMonth = String(this.getCurrenlyMonth());
  MesActual: any = this.getCurrenlyMonth();
  selectedCoin = 0;
  selectedCoinTable: String = '';//Variable en table
  /*DataSource Month y Acumulate*/
  dataSource = new MatTableDataSource<PerformanceGR>();
  dataSourceVARS = new MatTableDataSource<VarPerformance>();
  dataSourceAc = new MatTableDataSource<PerformanceGR>();
  dataSourceVARSAc = new MatTableDataSource<VarPerformance>();

  displayedColumns: String[] = ['region', 'moneda'];
  displayedColumnsVars: String[] = ['p_cantidad', 'p_ventas', 'p_precio'];


  public barChartOptions: any = {
    scaleShowVerticalLines: false,
    responsive: true,
    barThickness: 10
  };
  public barChartLabels: string[] = [

  ];
  public barChartType = 'horizontalBar';
  public barChartLegend = true;

  //barchart region
  public barChartData: any[] = [
  ];
  //barchart region acumulado
  public barChartDataAc: any[] = [
  ];
  public barChartColors: Array<any> = [

  ];


  listaitem: PerformanceGR[] = [];
  listItemYear: PerformanceGR[] = [];
  listavariacionmes: any = [];

  listIdMes: any[] = [];
  listIdPosicionYear: any[] = [];

  listamesVAR: VarPerformance[] = [];
  newlistmes: VarPerformance[] = [];
  newlistyear: VarPerformance[] = [];
  listyearVAR: VarPerformance[] = [];



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


  constructor(public userservice: UserService,
    private apollo: Apollo) {


  }


  // dataSource = new MatTableDataSource<PerformanceTopFive>(this.data);


  ngOnInit(): void {

    // let canvas: any = <HTMLCanvasElement>document.getElementById('canvas');
    // var s = getComputedStyle(canvas);
    // var w = s.width;
    // var h = s.height;
    // canvas.width = w.split("px")[0];
    // canvas.height = h.split("px")[0];



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

      this.queryMes = this.apollo.watchQuery({
        query: QIPTMES,
        variables: {
          idrol1: this.userservice.responseLogin.idUsuario,
          anioo: new Date().getFullYear(),
          mess: "0" + new Date().getMonth(),
          companiaa: this.userservice.responseLogin.companiaa[0].idCompaniaOdoo,
          monedadestinoo: this.userservice.responseLogin.companiaa[0].idMonedaEmpresaOdoo
        }
      }).valueChanges.subscribe((result: any) => {

        if (this.validaState(result)) {
          this.listaitem = [];
          this.listIdMes = [];
          let listBarPercentaje: any = [];
          let varsmes: Var[] = [];
          let varsyear: Var[] = [];

          if (result.data.performanceregionmes.lista != null) {
            let listaPerformanceMes = result.data.performanceregionmes.lista;
            for (let i: number = 0; i < listaPerformanceMes.length; i++) {

              let performance_producto = {
                region: listaPerformanceMes[i].nombre,
                moneda: Number(listaPerformanceMes[i].importeactual)
              };
              let posicion = {
                idPosicion: listaPerformanceMes[i].idPosicion,
                region: listaPerformanceMes[i].nombre
              }
              let diff = Number(listaPerformanceMes[i].importeactual) -
                Number(listaPerformanceMes[i].importeanterior);

              // varsmes[i].region=listaPerformanceMes[i].nombre;

              this.listaitem.push(performance_producto);
              this.listIdMes.push(posicion);

              this.barChartLabels.push(listaPerformanceMes[i].nombre);

              //this.listavariacionmes.push(diff);
              listBarPercentaje.push(diff);

            }
            this.fillbarchart(listBarPercentaje);

            this.dataSource = new MatTableDataSource<PerformanceGR>(this.listaitem);
            // this.listamesVAR = [];
            // this.newlistmes=[];
            this.listIdMes.forEach(item => {
              //setting property region in itemvarsmes object
              let valueregion = item.region;
              this.queryMesVars = this.apollo.watchQuery({
                query: QIVARS,
                variables: {
                  idrol1: this.userservice.responseLogin.idUsuario,
                  anioo: new Date().getFullYear(),
                  mess: "0" + new Date().getMonth(),
                  companiaa: this.userservice.responseLogin.companiaa[0].idCompaniaOdoo,
                  monedadestinoo: this.userservice.responseLogin.companiaa[0].idMonedaEmpresaOdoo,
                  ciudadid: item.idPosicion

                }

              }).valueChanges.subscribe((result: any) => {

                let listVarMes = result.data.raking_lista_mesanual_region.lista;

                let topvarMes = {
                  p_cantidad: Number(listVarMes[0].porcentaje_Monto_Mes.replace(',', '.')),
                  p_ventas: Number(listVarMes[1].porcentaje_Monto_Mes.replace(',', '.')),
                  p_precio: Number(listVarMes[2].porcentaje_Monto_Mes.replace(',', '.'))

                }
                let topvarYear = {
                  p_cantidad: Number(listVarMes[0].porcentaje_Monto_Acumulado.replace(',', '.')),
                  p_ventas: Number(listVarMes[1].porcentaje_Monto_Acumulado.replace(',', '.')),
                  p_precio: Number(listVarMes[2].porcentaje_Monto_Acumulado.replace(',', '.'))

                }

                let valuemes = {
                  region: valueregion,
                  topvar: topvarMes
                }
                let valueyear = {
                  region: valueregion,
                  topvar: topvarYear
                }

                varsmes.push(valuemes);
                varsyear.push(valueyear);

                this.listamesVAR.push(topvarMes);
                this.listyearVAR.push(topvarYear);
                this.orderList(varsyear, this.listaitem);
                // this.orderList(varsyear,this.list);

              });



            }

            );

            // this.orderList(varsmes,this.listaitem);
            // this.listamesVAR = this.listamesVAR.sort(function (a:any, b:any) {
            //   return a - b;
            // });


            //  this.dataSourceVARS = new MatTableDataSource<VarPerformance>(this.newlistmes);
          //  this.dataSourceVARSAc = new MatTableDataSource<VarPerformance>(this.newlistyear);


            //query acumulate OR YEAR
            this.queryYear = this.apollo.watchQuery({
              query: QIPACUMULADO,
              variables: {
                idrol1: this.userservice.responseLogin.idUsuario,
                anioo: new Date().getFullYear(),
                mess: "0" + new Date().getMonth(),
                companiaa: this.userservice.responseLogin.companiaa[0].idCompaniaOdoo,
                monedadestinoo: this.userservice.responseLogin.companiaa[0].idMonedaEmpresaOdoo
              }
            });
            this.queryYear.valueChanges.subscribe((result: any) => {
              this.listItemYear = [];
              this.listIdPosicionYear = [];
              let listBarPercentajeAc: any[] = [];
              if (result.data.performanceregionanual.lista != null) {
                let listaPerformanceYear = result.data.performanceregionanual.lista;

                for (let i: number = 0; i < listaPerformanceYear.length; i++) {
                  let performance_producto = {
                    region: listaPerformanceYear[i].nombre,
                    moneda: Number(listaPerformanceYear[i].importeactual)
                  };
                  let posicion = {
                    idPosicion: listaPerformanceYear[i].idPosicion,

                  }

                  let diff = Number(listaPerformanceYear[i].importeactual) -
                    Number(listaPerformanceYear[i].importeanterior);

                  listBarPercentajeAc.push(diff);
                  this.listItemYear.push(performance_producto);
                  this.listIdPosicionYear.push(posicion);



                  // this.barChartLabels.push( listaPerformanceYear[i].nombre);
                  this.orderListYear(varsyear, this.listItemYear);
                }
                this.fillbarchartAc(listBarPercentajeAc);

                this.dataSourceAc = new MatTableDataSource<PerformanceGR>(this.listItemYear);

              }
            });
          }

        }


        //console.log(result.data.performancetopmes['lista']);

      });

    }

  }
  private validaState(responsePGR: any) {

    let result: Boolean = true;
    for (let item of responsePGR.data.performanceregionmes.lista) {
      if (item.importeactual == 0) {
        result = false;
      }
      else break;
    }
    return result;

  }
  private orderList(listaVars: any, listaRegions: any) {

    let listVARS: VarPerformance[] = [];

    listaRegions.forEach((item: any) => {

      let value = listaVars.find((e: any) => e.region == item.region);
      if (value && value != undefined) {
        listVARS.push(value.topvar);
      }


    });
    this.newlistmes = listVARS;
    this.dataSourceVARS = new MatTableDataSource<VarPerformance>(this.newlistmes);

    // return listVARS;

  }
  private orderListYear(listaVars: any, listaRegions: any) {
 
    let listVARSYEAR: VarPerformance[] = [];

    listaRegions.forEach((item: any) => {

      let value = listaVars.find((e: any) => e.region == item.region);
      if (value && value != undefined) {
        listVARSYEAR.push(value.topvar);
      }


    });
    this.newlistyear = listVARSYEAR;
    this.dataSourceVARSAc = new MatTableDataSource<VarPerformance>(this.newlistyear);

    // return listVARS;

  }
  private fillbarchart(listabar: any) {
    this.barChartColors.push({ backgroundColor: 'rgb(31,78,120)' });

    this.barChartData[0] = {
      data: listabar,
      label: 'VS ' + (new Date().getFullYear() - 1),

    };
  }
  private fillbarchartAc(listabar: any) {
  
    this.barChartColors.push({ backgroundColor: 'rgb(31,78,120)' });

    this.barChartDataAc[0] = {
      data: listabar,
      label: 'VS ' + (new Date().getFullYear() - 1),

    };
  }
  // events
  public chartClicked({ event, active }: { event: MouseEvent, active: {}[] }): void {
    console.log(event, active);
  }

  public chartHovered({ event, active }: { event: MouseEvent, active: {}[] }): void {
    console.log(event, active);
  }
  /** Gets the total cost of all transactions. */
  getTotalCost(): any {
    let value = this.listaitem.map(t => t.moneda).reduce((acc, value) => acc + value, 0);
    // alert(avlue);
    return value;

    //   return this.data.map(t => t['first']).reduce((acc, value) => acc + value, 0);
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




  }
  onMonthChange(event: any) {


  }
  onCoinChange(event: any) {

  }



}

export interface PerformanceGR {
  region: string;
  moneda: number;
}
export interface Var {
  region: string,
  topvar: any
}

export interface VarPerformance {
  p_cantidad: any;
  p_ventas: any;
  p_precio: any;
}

