import { Component, OnInit } from '@angular/core';
import { ChartEvent } from 'ng-chartist';
import { ChartDataSets, ChartOptions, ChartType } from 'chart.js';

import { Label, SingleDataSet } from 'ng2-charts';
import { BreakpointObserver } from '@angular/cdk/layout';
import { MatTableDataSource } from '@angular/material/table';
import { UserService } from 'src/app/services/user.service';
import { Apollo, QueryRef } from 'apollo-angular';
import gql from 'graphql-tag';
import * as pluginDataLabels from 'chartjs-plugin-datalabels';
import { Subscription } from 'rxjs';
import { AuthServiceService } from 'src/app/services/auth-service.service';

const QIPTOP5 = gql`
query performancetop5($idrol1:Int!,$anioo:Int!,$mess:String,$companiaa:Int!, $monedadestinoo:Int!) {
  performancetop5(idrol1:$idrol1,anioo:$anioo,mess:$mess,companiaa:$companiaa, monedadestinoo:$monedadestinoo){
    tablero{
      idTablero
      nombreTablero
      estadoTablero
      urlTablero
      idCategoria
      
    }
    listames{
      idPosicion
      nombre
       importeactual
      importeanterior
      porcentajetorta
      detalle_Receptor{
        lista{
          idIndicador
          nombreIndicador
          monto_Mes
          porcentaje_Monto_Mes
          monto_Acumulado
          porcentaje_Monto_Acumulado
          vs
        }
        detallelista{
          idPosicion
          nombre
          precio
        }
      }
    }
    
      listaanual{
   idPosicion
      nombre
       importeactual
      importeanterior
      porcentajetorta
      detalle_Receptor{
        lista{
          idIndicador
          nombreIndicador
          monto_Mes
          porcentaje_Monto_Mes
          monto_Acumulado
          porcentaje_Monto_Acumulado
          vs
        }
        detallelista{
          idPosicion
          nombre
          precio
        }
      }
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
@Component({
  selector: 'app-performance-top5',
  templateUrl: './performance-top5.component.html',
  styleUrls: ['./performance-top5.component.scss']
})
export class PerformanceTop5Component implements OnInit {
  
  //queries for GraphQL
  private queryPerformanceTop5: Subscription;
  private queryLogin: Subscription;

  constructor(public userservice: UserService,
    private apollo: Apollo,private serviceAuth: AuthServiceService) {
    this.queryPerformanceTop5 = new Subscription();
    this.queryLogin=new Subscription();
  }

  selectedyear = String(new Date().getFullYear());
  selectedMonth = String(this.getCurrenlyMonth());
  MesActual: any = this.getCurrenlyMonth();
  selectedCoin = 0;
  selectedCoinTable: String = '';//Variable en table
  /*DataSource Month y Acumulate*/
  dataSource = new MatTableDataSource<PerformanceTopFive>();
  dataSourceVARS = new MatTableDataSource<TopVar>();
  dataSourceAc = new MatTableDataSource<PerformanceTopFive>();
  dataSourceVARSAc = new MatTableDataSource<TopVar>();

  displayedColumns: String[] = ['conta', 'producto', 'us'];
  displayedColumnsMesVars: String[] = ['p_cantidad', 'p_ventas', 'p_precio'];

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

  public barChartLabels: string[] = [];
  public barChartType = 'horizontalBar';
  public barChartLegend = true;

  //barchart region
  public barChartData: any[] = [];
  //barchart region acumulado
  public barChartDataAc: any[] = [
  ];
  public barChartColors: Array<any> = [];



  listaitem: PerformanceTopFive[] = [];
  listItemYear: PerformanceTopFive[] = [];


  listamesVAR: TopVar[] = [];
  listyearVAR: TopVar[] = [];

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

      this.queryPerformanceTop5 = this.apollo.watchQuery({
        query: QIPTOP5,
        variables: {
          idrol1: this.userservice.responseLogin.idUsuario,
          anioo: new Date().getFullYear(),
          mess: this.getCurrenlyMonth(),
          companiaa: this.userservice.responseLogin.companiaa[0].idCompaniaOdoo,
          monedadestinoo: this.userservice.responseLogin.companiaa[0].idMonedaEmpresaOdoo
        }
      }).valueChanges.subscribe((response: any) => {

        if (response.data.performancetop5.listames && response.data.performancetop5.listaanual) {
          let listaPerformanceMes = response.data.performancetop5.listames;
          let listaPerformanceYear = response.data.performancetop5.listaanual;

          let listBarPercentaje: any = [];
          let listBarPercentajeAc: any[] = [];

          this.listaitem = [];
          this.listItemYear = [];

          for (let i: number = 0; i < listaPerformanceMes.length; i++) {
            let performance_producto = {
              'conta': i + 1,
              'producto': listaPerformanceMes[i].nombre,
              'us': Number(listaPerformanceMes[i].importeactual)
            };

            let diff = Number(listaPerformanceMes[i].importeactual) -
              Number(listaPerformanceMes[i].importeanterior);

            listBarPercentaje.push(diff);
            this.barChartColors.push({ backgroundColor: 'rgb(31,78,120)' });
            this.barChartLabels.push(listaPerformanceMes[i].nombre);

            this.barChartData[0] = {
              data: listBarPercentaje,
              label: 'VS ' + (new Date().getFullYear() - 1),

            };

            this.listaitem.push(performance_producto);

            let listVarMes = listaPerformanceMes[i].detalle_Receptor.lista;
            let cantidad = listVarMes.find((e: any) => e.nombreIndicador === "CANTIDAD DE VENTAS").porcentaje_Monto_Mes;
            let ventas = listVarMes.find((e: any) => e.nombreIndicador == "VENTAS").porcentaje_Monto_Mes;
            let precio = listVarMes.find((e: any) => e.nombreIndicador == "VENTAS").porcentaje_Monto_Mes;

            let topvarMes = {
              p_cantidad: Number(cantidad.replace(',', '.')),
              p_ventas: Number(ventas.replace(',', '.')),
              p_precio: Number(precio.replace(',', '.'))

            }
            this.listamesVAR.push(topvarMes);


          }
          for (let j: number = 0; j < listaPerformanceYear.length; j++) {
            let performance_producto_year = {
              'conta': j + 1,
              'producto': listaPerformanceYear[j].nombre,
              'us': Number(listaPerformanceYear[j].importeactual)
            };
            let diffyear = Number(listaPerformanceMes[j].importeactual) -
              Number(listaPerformanceMes[j].importeanterior);

            this.barChartColors.push({ backgroundColor: 'rgb(31,78,120)' });
            listBarPercentajeAc.push(diffyear);

            this.barChartDataAc[0] = {
              data: listBarPercentajeAc,
              label: 'VS ' + (new Date().getFullYear() - 1),

            };


            this.listItemYear.push(performance_producto_year);

            let listVarYear = listaPerformanceMes[j].detalle_Receptor.lista;
            let cantidadyear = listVarYear.find((e: any) => e.nombreIndicador === "CANTIDAD DE VENTAS").porcentaje_Monto_Acumulado;
            let ventasyear = listVarYear.find((e: any) => e.nombreIndicador == "VENTAS").porcentaje_Monto_Acumulado;
            let precioyear = listVarYear.find((e: any) => e.nombreIndicador == "VENTAS").porcentaje_Monto_Acumulado;
            let topvarYear = {
              p_cantidad: Number(cantidadyear.replace(',', '.')),
              p_ventas: Number(ventasyear.replace(',', '.')),
              p_precio: Number(precioyear.replace(',', '.'))

            }
            this.listyearVAR.push(topvarYear);


          }
          this.dataSource = new MatTableDataSource<PerformanceTopFive>(this.listaitem);
          this.dataSourceVARS = new MatTableDataSource<TopVar>(this.listamesVAR);

          this.dataSourceAc = new MatTableDataSource<PerformanceTopFive>(this.listItemYear);
          this.dataSourceVARSAc = new MatTableDataSource<TopVar>(this.listyearVAR);


        }
      }

      );



    }
    else{
      this.queryLogin = this.apollo.watchQuery({
        query: LOGIN,
        variables: { usuario: this.serviceAuth.userData?.name, clave: this.serviceAuth.userData?.password }
      }).valueChanges.subscribe((response: any) => {
        this.userservice.responseLogin = response.data.validarlogin;
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
        this.queryPerformanceTop5 = this.apollo.watchQuery({
          query: QIPTOP5,
          variables: {
            idrol1: this.userservice.responseLogin.idUsuario,
            anioo: new Date().getFullYear(),
            mess: this.getCurrenlyMonth(),
            companiaa: this.userservice.responseLogin.companiaa[0].idCompaniaOdoo,
            monedadestinoo: this.userservice.responseLogin.companiaa[0].idMonedaEmpresaOdoo
          }
        }).valueChanges.subscribe((response: any) => {
  
          if (response.data.performancetop5.listames && response.data.performancetop5.listaanual) {
            let listaPerformanceMes = response.data.performancetop5.listames;
            let listaPerformanceYear = response.data.performancetop5.listaanual;
  
            let listBarPercentaje: any = [];
            let listBarPercentajeAc: any[] = [];
  
            this.listaitem = [];
            this.listItemYear = [];
  
            for (let i: number = 0; i < listaPerformanceMes.length; i++) {
              let performance_producto = {
                'conta': i + 1,
                'producto': listaPerformanceMes[i].nombre,
                'us': Number(listaPerformanceMes[i].importeactual)
              };
  
              let diff = Number(listaPerformanceMes[i].importeactual) -
                Number(listaPerformanceMes[i].importeanterior);
  
              listBarPercentaje.push(diff);
              this.barChartColors.push({ backgroundColor: 'rgb(31,78,120)' });
              this.barChartLabels.push(listaPerformanceMes[i].nombre);
  
              this.barChartData[0] = {
                data: listBarPercentaje,
                label: 'VS ' + (new Date().getFullYear() - 1),
  
              };
  
              this.listaitem.push(performance_producto);
  
              let listVarMes = listaPerformanceMes[i].detalle_Receptor.lista;
              let cantidad = listVarMes.find((e: any) => e.nombreIndicador === "CANTIDAD DE VENTAS").porcentaje_Monto_Mes;
              let ventas = listVarMes.find((e: any) => e.nombreIndicador == "VENTAS").porcentaje_Monto_Mes;
              let precio = listVarMes.find((e: any) => e.nombreIndicador == "VENTAS").porcentaje_Monto_Mes;
  
              let topvarMes = {
                p_cantidad: Number(cantidad.replace(',', '.')),
                p_ventas: Number(ventas.replace(',', '.')),
                p_precio: Number(precio.replace(',', '.'))
  
              }
              this.listamesVAR.push(topvarMes);
  
  
            }
            for (let j: number = 0; j < listaPerformanceYear.length; j++) {
              let performance_producto_year = {
                'conta': j + 1,
                'producto': listaPerformanceYear[j].nombre,
                'us': Number(listaPerformanceYear[j].importeactual)
              };
              let diffyear = Number(listaPerformanceMes[j].importeactual) -
                Number(listaPerformanceMes[j].importeanterior);
  
              this.barChartColors.push({ backgroundColor: 'rgb(31,78,120)' });
              listBarPercentajeAc.push(diffyear);
  
              this.barChartDataAc[0] = {
                data: listBarPercentajeAc,
                label: 'VS ' + (new Date().getFullYear() - 1),
  
              };
  
  
              this.listItemYear.push(performance_producto_year);
  
              let listVarYear = listaPerformanceMes[j].detalle_Receptor.lista;
              let cantidadyear = listVarYear.find((e: any) => e.nombreIndicador === "CANTIDAD DE VENTAS").porcentaje_Monto_Acumulado;
              let ventasyear = listVarYear.find((e: any) => e.nombreIndicador == "VENTAS").porcentaje_Monto_Acumulado;
              let precioyear = listVarYear.find((e: any) => e.nombreIndicador == "VENTAS").porcentaje_Monto_Acumulado;
              let topvarYear = {
                p_cantidad: Number(cantidadyear.replace(',', '.')),
                p_ventas: Number(ventasyear.replace(',', '.')),
                p_precio: Number(precioyear.replace(',', '.'))
  
              }
              this.listyearVAR.push(topvarYear);
  
  
            }
            this.dataSource = new MatTableDataSource<PerformanceTopFive>(this.listaitem);
            this.dataSourceVARS = new MatTableDataSource<TopVar>(this.listamesVAR);
  
            this.dataSourceAc = new MatTableDataSource<PerformanceTopFive>(this.listItemYear);
            this.dataSourceVARSAc = new MatTableDataSource<TopVar>(this.listyearVAR);
  
  
          }
        }
  
        );
  
        
      });
    }

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
    let value = this.listaitem.map(t => t.us).reduce((acc, value) => acc + value, 0);
    return value;

    //   return this.data.map(t => t['first']).reduce((acc, value) => acc + value, 0);
  }
  getTotalCostAc(){
    let value = this.listItemYear.map(t => t.us).reduce((acc, value) => acc + value, 0);
    return value;
  }
  getCurrenlyMonth() {
    let month = new Date().getMonth() + 1;
    if (month < 10) {
      return "0" + month;
    }
    else {
      return String(month);
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
  refreshQuery() {

    if (this.userservice.responseLogin) {
      this.barChartLabels = [];

      let arraymonedas = this.userservice.responseLogin.monedass;
      this.selectedCoinTable = arraymonedas.find((e: any) => e.idMonedaEmpresaOdoo ==
        this.selectedCoin).name
      this.queryPerformanceTop5 = this.apollo.watchQuery({
        query: QIPTOP5,
        variables: {
          idrol1: this.userservice.responseLogin.idUsuario,
          anioo: Number(this.selectedyear),
          mess: this.selectedMonth,
          companiaa: this.userservice.responseLogin.companiaa[0].idCompaniaOdoo,
          monedadestinoo: this.selectedCoin
        }
      }).valueChanges.subscribe((response: any) => {
        this.barChartData = [];
      
        this.listamesVAR = [];
        this.listyearVAR = [];
        if (response.data.performancetop5.listames && response.data.performancetop5.listaanual) {
          let listaPerformanceMes = response.data.performancetop5.listames;
          let listaPerformanceYear = response.data.performancetop5.listaanual;
          let listBarPercentaje: any = [];
          let listBarPercentajeAc: any[] = [];

          this.listaitem = [];
          this.listItemYear = [];

          for (let i: number = 0; i < listaPerformanceMes.length; i++) {
            let performance_producto = {
              'conta': i + 1,
              'producto': listaPerformanceMes[i].nombre,
              'us': Number(listaPerformanceMes[i].importeactual)
            };

            let diff = Number(listaPerformanceMes[i].importeactual) -
              Number(listaPerformanceMes[i].importeanterior);

            listBarPercentaje.push(diff);
            this.barChartColors.push({ backgroundColor: 'rgb(31,78,120)' });
            this.barChartLabels.push(listaPerformanceMes[i].nombre);

            this.barChartData[0] = {
              data: listBarPercentaje,
              label: 'VS ' + (new Date().getFullYear() - 1),

            };

            this.listaitem.push(performance_producto);

            let listVarMes = listaPerformanceMes[i].detalle_Receptor.lista;
            let cantidad = listVarMes.find((e: any) => e.nombreIndicador === "CANTIDAD DE VENTAS").porcentaje_Monto_Mes;
            let ventas = listVarMes.find((e: any) => e.nombreIndicador == "VENTAS").porcentaje_Monto_Mes;
            let precio = listVarMes.find((e: any) => e.nombreIndicador == "VENTAS").porcentaje_Monto_Mes;

            let topvarMes = {
              p_cantidad: Number(cantidad.replace(',', '.')),
              p_ventas: Number(ventas.replace(',', '.')),
              p_precio: Number(precio.replace(',', '.'))

            }
            this.listamesVAR.push(topvarMes);


          }
          this.barChartLabels = [];
          for (let j: number = 0; j < listaPerformanceYear.length; j++) {
            
           
            let performance_producto_year = {
              'conta': j + 1,
              'producto': listaPerformanceYear[j].nombre,
              'us': Number(listaPerformanceYear[j].importeactual)
            };
            let diffyear = Number(listaPerformanceYear[j].importeactual) -
              Number(listaPerformanceYear[j].importeanterior);
            
            this.barChartColors.push({ backgroundColor: 'rgb(31,78,120)' });
            this.barChartLabels.push(listaPerformanceYear[j].nombre);
            listBarPercentajeAc.push(diffyear);

            this.barChartDataAc[0] = {
              data: listBarPercentajeAc,
              label: 'VS ' + (new Date().getFullYear() - 1),

            };


            this.listItemYear.push(performance_producto_year);

            let listVarYear = listaPerformanceYear[j].detalle_Receptor.lista;
            let cantidadyear = listVarYear.find((e: any) => e.nombreIndicador === "CANTIDAD DE VENTAS").porcentaje_Monto_Acumulado;
            let ventasyear = listVarYear.find((e: any) => e.nombreIndicador == "VENTAS").porcentaje_Monto_Acumulado;
            let precioyear = listVarYear.find((e: any) => e.nombreIndicador == "VENTAS").porcentaje_Monto_Acumulado;
            let topvarYear = {
              p_cantidad: Number(cantidadyear.replace(',', '.')),
              p_ventas: Number(ventasyear.replace(',', '.')),
              p_precio: Number(precioyear.replace(',', '.'))

            }
            this.listyearVAR.push(topvarYear);


          }
          this.dataSource = new MatTableDataSource<PerformanceTopFive>(this.listaitem);
          this.dataSourceVARS = new MatTableDataSource<TopVar>(this.listamesVAR);

          this.dataSourceAc = new MatTableDataSource<PerformanceTopFive>(this.listItemYear);
          this.dataSourceVARSAc = new MatTableDataSource<TopVar>(this.listyearVAR);


        }
      }

      );

    }
  }
  ngOnDestroy(): void {

    this.queryPerformanceTop5.unsubscribe();
  }
  getAbsoluto(value: number) {
    return Math.abs(value);
  }

}
export interface PerformanceTopFive {
  conta: number;
  producto: string;
  us: number;
}
export interface TopVar {
  p_cantidad: any;
  p_ventas: any;
  p_precio: any;
}
