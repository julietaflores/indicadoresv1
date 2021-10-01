import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Apollo } from 'apollo-angular';
import { ChartDataSets, ChartOptions, ChartType } from 'chart.js';
import gql from 'graphql-tag';
import { Label, SingleDataSet } from 'ng2-charts';
import { UserService } from 'src/app/services/user.service';
import * as pluginDataLabels from 'chartjs-plugin-datalabels';
import { NEVER, Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';

const QIPREGION = gql`
query performanceregion($idrol1:Int!,$anioo:Int!,$mess:String,$companiaa:Int!, $monedadestinoo:Int!) {
  performanceregion(idrol1:$idrol1,anioo:$anioo,mess:$mess,companiaa:$companiaa, monedadestinoo:$monedadestinoo){
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


@Component({
  selector: 'app-performance-general-regiones',
  templateUrl: './performance-general-regiones.component.html',
  styleUrls: ['./performance-general-regiones.component.scss']
})
export class PerformanceGeneralRegionesComponent implements OnInit, OnDestroy {

  //queries for GraphQL
  queryMes: Subscription;//get first list products
  queryMesVars: any;//query list for each product
  queryYear: any;

  queryPerformanceRegion: Subscription;

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
    this.queryMes = new Subscription();
    this.queryPerformanceRegion = new Subscription();
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
      this.initialSetup();
      this.queryPerformanceRegion = this.apollo.watchQuery(
        {
          query: QIPREGION,
          variables: {
            idrol1: this.userservice.responseLogin.idUsuario,
            anioo: new Date().getFullYear(),
            mess: this.getCurrenlyMonth(),
            companiaa: this.userservice.responseLogin.companiaa[0].idCompaniaOdoo,
            monedadestinoo: this.userservice.responseLogin.companiaa[0].idMonedaEmpresaOdoo
          }
        }
      ).valueChanges.subscribe((response: any) => {
        if (response.data.performanceregion.listames && response.data.performanceregion.listaanual) {
          let listaPerformanceMes = response.data.performanceregion.listames;
          let listaPerformanceYear = response.data.performanceregion.listaanual;

          let listBarPercentaje: any = [];
          let listBarPercentajeAc: any[] = [];

          this.listaitem=[];
          this.listItemYear = [];


          listaPerformanceMes.forEach((item: any) => {
            let performance_producto = {
              region: item.nombre,
              moneda: Number(item.importeactual)
            };
            let diff = Number(item.importeactual) - Number(item.importeanterior);

            this.listaitem.push(performance_producto);

            this.barChartLabels.push(item.nombre);
            listBarPercentaje.push(diff);
            this.fillbarchart(listBarPercentaje);

            let listVarMes = item.detalle_Receptor.lista;
            let cantidad = listVarMes.find((e: any) => e.nombreIndicador === "CANTIDAD DE VENTAS").porcentaje_Monto_Mes;
            let ventas = listVarMes.find((e: any) => e.nombreIndicador == "VENTAS").porcentaje_Monto_Mes;
            let precio = listVarMes.find((e: any) => e.nombreIndicador == "VENTAS").porcentaje_Monto_Mes;
            let topvarMes = {
              p_cantidad: Number(cantidad.replace(',', '.')),
              p_ventas: Number(ventas.replace(',', '.')),
              p_precio: Number(precio.replace(',', '.'))

            }
            this.listamesVAR.push(topvarMes);

          });
          listaPerformanceYear.forEach((item: any) => {
            let performance_producto_year = {
              region: item.nombre,
              moneda: Number(item.importeactual)
            };
            let diffyear = Number(item.importeactual) - Number(item.importeanterior);
        
           
            this.listItemYear.push(performance_producto_year);
            listBarPercentajeAc.push(diffyear);
            this.fillbarchartAc(listBarPercentajeAc);

            let listVarYear = item.detalle_Receptor.lista;
            let cantidadyear = listVarYear.find((e: any) => e.nombreIndicador === "CANTIDAD DE VENTAS").porcentaje_Monto_Acumulado;
            let ventasyear = listVarYear.find((e: any) => e.nombreIndicador == "VENTAS").porcentaje_Monto_Acumulado;
            let precioyear = listVarYear.find((e: any) => e.nombreIndicador == "VENTAS").porcentaje_Monto_Acumulado;
            let topvarYear = {
              p_cantidad: Number(cantidadyear.replace(',', '.')),
              p_ventas: Number(ventasyear.replace(',', '.')),
              p_precio: Number(precioyear.replace(',', '.'))

            }
            this.listyearVAR.push(topvarYear);
          });
          this.dataSource = new MatTableDataSource<PerformanceGR>(this.listaitem);
          this.dataSourceVARS = new MatTableDataSource<VarPerformance>(this.listamesVAR);
          
          this.dataSourceAc = new MatTableDataSource<PerformanceGR>(this.listItemYear);
          this.dataSourceVARSAc = new MatTableDataSource<VarPerformance>(this.listyearVAR);
        }
      }
      );
    }

   

  }
  private initialSetup() {
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

  }
  getAbsoluto(value: number) {
    return Math.abs(value);
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

  private fillbarchart(listabar: any) {
    this.barChartData = [];
    this.barChartColors.push({ backgroundColor: 'rgb(31,78,120)' });

    this.barChartData[0] = {
      data: listabar,
      label: 'VS ' + (new Date().getFullYear() - 1),

    };
  }
  private fillbarchartAc(listabar: any) {
    this.barChartDataAc = [];
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
  }
  getTotalAc(): any {
    let value = this.listItemYear.map(t => t.moneda).reduce((acc, value) => acc + value, 0);
    // alert(avlue);
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

    //getting data from Login
    if (this.userservice.responseLogin) {
      this.barChartLabels = [];
     
      let arraymonedas = this.userservice.responseLogin.monedass;
      this.selectedCoinTable = arraymonedas.find((e: any) => e.idMonedaEmpresaOdoo ==
        this.selectedCoin).name
        this.queryPerformanceRegion = this.apollo.watchQuery(
          {
            query: QIPREGION,
            variables: {
              idrol1: this.userservice.responseLogin.idUsuario,
              anioo: Number(this.selectedyear),
              mess: this.selectedMonth,
              companiaa: this.userservice.responseLogin.companiaa[0].idCompaniaOdoo,
              monedadestinoo: this.selectedCoin
            }
          }
        ).valueChanges.subscribe((response: any) => {
          if (response.data.performanceregion.listames && response.data.performanceregion.listaanual) {
           
            this.barChartData = [];
            this.barChartLabels = [];
            this.listamesVAR = [];
            this.listyearVAR = [];
            let listaPerformanceMes = response.data.performanceregion.listames;
            let listaPerformanceYear = response.data.performanceregion.listaanual;
  
            let listBarPercentaje: any = [];
            let listBarPercentajeAc: any[] = [];
  
            this.listaitem=[];
            this.listItemYear = [];
  
  
            listaPerformanceMes.forEach((item: any) => {
              let performance_producto = {
                region: item.nombre,
                moneda: Number(item.importeactual)
              };
              let diff = Number(item.importeactual) - Number(item.importeanterior);
  
              this.listaitem.push(performance_producto);
  
              this.barChartLabels.push(item.nombre);
              listBarPercentaje.push(diff);
              this.fillbarchart(listBarPercentaje);
  
              let listVarMes = item.detalle_Receptor.lista;
              let cantidad = listVarMes.find((e: any) => e.nombreIndicador === "CANTIDAD DE VENTAS").porcentaje_Monto_Mes;
              let ventas = listVarMes.find((e: any) => e.nombreIndicador == "VENTAS").porcentaje_Monto_Mes;
              let precio = listVarMes.find((e: any) => e.nombreIndicador == "VENTAS").porcentaje_Monto_Mes;
              let topvarMes = {
                p_cantidad: Number(cantidad.replace(',', '.')),
                p_ventas: Number(ventas.replace(',', '.')),
                p_precio: Number(precio.replace(',', '.'))
  
              }
              this.listamesVAR.push(topvarMes);
  
            });
            listaPerformanceYear.forEach((item: any) => {
              let performance_producto_year = {
                region: item.nombre,
                moneda: Number(item.importeactual)
              };
              let diffyear = Number(item.importeactual) - Number(item.importeanterior);
          
             
              this.listItemYear.push(performance_producto_year);
              listBarPercentajeAc.push(diffyear);
              this.fillbarchartAc(listBarPercentajeAc);
  
              let listVarYear = item.detalle_Receptor.lista;
              let cantidadyear = listVarYear.find((e: any) => e.nombreIndicador === "CANTIDAD DE VENTAS").porcentaje_Monto_Mes;
              let ventasyear = listVarYear.find((e: any) => e.nombreIndicador == "VENTAS").porcentaje_Monto_Mes;
              let precioyear = listVarYear.find((e: any) => e.nombreIndicador == "VENTAS").porcentaje_Monto_Mes;
              let topvarYear = {
                p_cantidad: Number(cantidadyear.replace(',', '.')),
                p_ventas: Number(ventasyear.replace(',', '.')),
                p_precio: Number(precioyear.replace(',', '.'))
  
              }
              this.listyearVAR.push(topvarYear);
            });
            this.dataSource = new MatTableDataSource<PerformanceGR>(this.listaitem);
            this.dataSourceVARS = new MatTableDataSource<VarPerformance>(this.listamesVAR);
            
            this.dataSourceAc = new MatTableDataSource<PerformanceGR>(this.listItemYear);
            this.dataSourceVARSAc = new MatTableDataSource<VarPerformance>(this.listyearVAR);
          }
        }
        );
     
    }
  }
  ngOnDestroy(): void {
    this.queryMes.unsubscribe();
    this.queryPerformanceRegion.unsubscribe();
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

