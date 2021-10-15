import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Apollo } from 'apollo-angular';
import { ChartDataSets, ChartOptions, ChartType } from 'chart.js';
import gql from 'graphql-tag';
import { Label, SingleDataSet } from 'ng2-charts';
import { UserService } from 'src/app/services/user.service';
import * as pluginDataLabels from 'chartjs-plugin-datalabels';
import { NEVER, Observable, Subscription } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { AuthServiceService } from 'src/app/services/auth-service.service';
import { TranslateService } from '@ngx-translate/core';
import { GlobalConstants } from 'src/app/GLOBALS/GlobalConstants';
import { json } from 'ngx-custom-validators/src/app/json/validator';
import { Alert } from 'selenium-webdriver';

const MGREGIONAUX = gql`
query margenbruto_region($idusuario:Int!,$anio:Int!,$mes:String,$compania:Int!, $monedadestino:Int!) {
  margenbruto_region(idusuario:$idusuario,anio:$anio,mes:$mes,compania:$compania, monedadestino:$monedadestino){
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
const MGREGIONAUX2 = gql`
query margenbruto_region($idusuario:Int!,$anio:Int!,$mes:String,$compania:Int!, $monedadestino:Int!) {
  margenbruto_region(idusuario:$idusuario,anio:$anio,mes:$mes,compania:$compania, monedadestino:$monedadestino){
    tablero{
      idTablero
      nombreTablero
      estadoTablero
      urlTablero
      idCategoria
      
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

const QIPREGION = gql`
query performanceregion($idusuario:Int!,$anio:Int!,$mes:String,$compania:Int!, $monedadestino:Int!) {
  performanceregion(idusuario:$idusuario,anio:$anio,mes:$mes,compania:$compania, monedadestino:$monedadestino){
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
     passwordd
     fechacreacionusuario
     iDRolUsuario
     codIdioma
     estado
     anioo{
       descripcion_anio{
         auxiliarId
         nombre
       }
       
     }
     
     mess{
       descripcion_mes{
         auxiliarId
         nombre
         
       }
       
       info_mes{
         mesid
         nombre
       }
     }
     
     monedass{
       descripcion_moneda{
         auxiliarId
         nombre
         
       }
       info_moneda{
          monedaId
       idMonedaEmpresaOdoo
       name
       symbol
       rate
       estado
       }
      
       
     }
     companiaa{
        idCompaniaOdoo
         name
       idMonedaEmpresaOdoo
       estado
       
     }
     idioma{
       codigoIdioma
       abreviaturaIdioma
       detalleIdioma
     }
 
    
   
    }
  }
  `;


@Component({
  selector: 'app-margenes-brutos-regiones-auxiliar',
  templateUrl: './margenes-brutos-regiones-auxiliar.component.html',
  styleUrls: ['./margenes-brutos-regiones-auxiliar.component.scss']
})
export class MargenesBrutosRegionesAuxiliarComponent implements OnInit, OnDestroy {
  postf: Observable<any>;
  //queries for GraphQL
  queryPerformanceRegion: Subscription;
  queryPerformanceRegion2: Subscription;
  private queryLogin: Subscription;

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

  placeholderYear: String = 'Year';
  placeholderMonth: String = 'Month';
  placeholderCoin: String = 'Currency';

  public barChartOptions: any = {
    responsive: true,
    maintainAspectRatio: false,

    scales: {
      yAxes: [{

        ticks: {
          fontSize: 12
        }
      }],
      xAxes: [{
        ticks: {
          fontSize: 12,
        }
      }],
    },
    plugins: {
      datalabels: {
        color: 'black',
        font: {
          weight: "bold",
          size: 10
        },
        anchor: 'center',
        display: true,
        align: 'start',
        padding: function (labor_anc: number) {
          labor_anc = screen.width;
          console.log('cc ' + labor_anc);

          switch (true) {
            case (labor_anc >= 320) && (labor_anc <= 575):
              console.log('modo celular');
              return 10;
              break;
            case (labor_anc >= 576) && (labor_anc <= 767):
              console.log('modo celular version 1');
              return 10;
              break;
            case (labor_anc >= 768) && (labor_anc <= 1023):
              console.log('modo celular version 2');
              return 9;
              break;
            case (labor_anc >= 1024) && (labor_anc <= 1439):
              console.log('modo celular version 3');
              return 8;
              break;

            case (labor_anc >= 1440):
              console.log('modo celular version 4');
              return 7;
              break;

          }

          if (labor_anc >= 320 && labor_anc <= 516) {

            console.log('modo celular');
            return 10;
          } else {

            console.log('modo mayor');
            return 30;
          }


        },

        formatter: function (value: any) {
          return Number.parseFloat(value).toFixed(2);
        },
      },
      labels: {
        shadowColor: 'black',
        shadowBlur: 10,
        color: 'red'
      }
    }
  };

  public barChartLabels: string[] = [];
  public barChartType = 'horizontalBar';
  public barChartLegend = true;

  //barchart region
  public barChartData: any[] = [];
  //barchart region acumulado
  public barChartDataAc: any[] = [];
 
  amoutIncremented: any;
  amoutIncrementedcanvas: any;

  amoutIncrementedAc: any;
  amoutIncrementedcanvasAc: any;

  listaitem: PerformanceGR[] = [];
  listItemYear: PerformanceGR[] = [];

  listIdMes: any[] = [];
  listIdPosicionYear: any[] = [];

  listamesVAR: VarPerformance[] = [];
  newlistmes: VarPerformance[] = [];
  newlistyear: VarPerformance[] = [];
  listyearVAR: VarPerformance[] = [];


  langDefault: any = '';

  coins: any[] = [];
  years: any[] = GlobalConstants.years;
  months: any[] = [];


  constructor(public userservice: UserService,
    private apollo: Apollo, private serviceAuth: AuthServiceService,
    public translateService: TranslateService) {
    this.queryPerformanceRegion = new Subscription();
    this.queryPerformanceRegion2 = new Subscription();
    this.queryLogin = new Subscription();
    this.postf = new Observable<any>();
  }


  // dataSource = new MatTableDataSource<PerformanceTopFive>(this.data);


  ngOnInit(): void {

    this.apollo.watchQuery(
      {
        query: MGREGIONAUX,
        variables: {
          idusuario: 3,
          anio: 2021,
          mes: "10",
          compania: 1,
          monedadestino: 1
        },
        fetchPolicy: "no-cache"
      }
    ).valueChanges.subscribe(result=>{
      console.log("data"+JSON.stringify(result))
    });
    this.apollo.watchQuery<any>(
      {
        query: MGREGIONAUX,
        variables: {
          idusuario: 3,
          anio: 2021,
          mes: "10",
          compania: 1,
          monedadestino: 1
        },
        fetchPolicy: "cache-and-network"
      }
    ).valueChanges.subscribe(({data,loading}) => {
      // let listaPerformanceMes = response.data.margenbruto_region.lista_mes;

      console.log('dd aux  ' + JSON.stringify(loading))
      console.log('dd aux  1 ' + JSON.stringify(data.margenbruto_region.lista_mes))
      
    });

    this.queryPerformanceRegion = this.apollo.query(
      {
        query: MGREGIONAUX,
        variables: {
          idusuario: 3,
          anio: 2021,
          mes: "10",
          compania: 1,
          monedadestino: 1
        },
        fetchPolicy: "network-only"
      }
    ).subscribe((response: any) => {
      let listaPerformanceMes = response.data.margenbruto_region.lista_mes;
      console.log('dd ' + JSON.stringify(listaPerformanceMes))


      // this.queryPerformanceRegion2 = this.apollo.query(
      //   {
      //     query:  MGREGIONAUX2,
      //     variables: {
      //       idusuario: 3,
      //       anio: 2021,
      //       mes: "10",
      //       compania: 1,
      //       monedadestino: 1
      //     },
      //     fetchPolicy: "network-only"
      //   }
      // ).subscribe((response: any) => {

      //   let listaPerformanceYear = response.data.margenbruto_region.lista_anual;
      //   console.log('dd ' + JSON.stringify(listaPerformanceYear))

      // });

    });



    //  console.log(this.queryPerformanceRegion);


    //   this.postf= this.apollo
    //   .watchQuery({query:MGREGIONAUX, variables: {
    //     idusuario: 3,
    //     anio: 2021,
    //     mes: "10",
    //     compania: 1,
    //     monedadestino: 1
    //   }})
    //   .valueChanges.pipe(map((result)=>
    //     console.log(result.data) ));





  }
  private initialSetup() {
    this.months = [];
    this.coins = [];
    this.placeholderYear = this.userservice.responseLogin.anioo.descripcion_anio.nombre;
    this.placeholderMonth = this.userservice.responseLogin.mess.descripcion_mes.nombre;
    this.placeholderCoin = this.userservice.responseLogin.monedass.descripcion_moneda.nombre;

    this.selectedCoin = this.userservice.responseLogin.companiaa[0].idMonedaEmpresaOdoo;
    let arraymonedas = this.userservice.responseLogin.monedass.info_moneda;
    let arrayMeses: any = this.userservice.responseLogin.mess.info_mes;
    this.selectedCoinTable = arraymonedas.find((e: any) => e.idMonedaEmpresaOdoo ==
      this.userservice.responseLogin.companiaa[0].idMonedaEmpresaOdoo).name;

    arrayMeses.forEach((item: any) => {
      const mes = {
        value: String(item.mesid),
        viewValue: item.nombre
      }
      this.months.push(mes);
    });
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

    this.barChartData[0] = {
      data: listabar,
      label: 'VS ' + (new Date().getFullYear() - 1),
      barThickness: 40,
      barPercentage: 0.5

    };
  }
  private fillbarchartAc(listabar: any) {
    this.barChartDataAc = [];
    
    this.barChartDataAc[0] = {
      data: listabar,
      label: 'VS ' + (new Date().getFullYear() - 1),
      barThickness: 40,
      barPercentage: 0.5
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

      this.months = [];
      this.barChartLabels = [];
      this.coins = [];

      let arraymonedas = this.userservice.responseLogin.monedass.info_moneda;
      let arrayMeses: any = this.userservice.responseLogin.mess.info_mes;
      arrayMeses.forEach((item: any) => {
        const mes = {
          value: String(item.mesid),
          viewValue: item.nombre
        }
        this.months.push(mes);
      });
      arraymonedas.forEach((e: any) => {
        let coin = {
          value: e.idMonedaEmpresaOdoo,
          viewValue: e.name
        };
        this.coins.push(coin);
      });

      this.selectedCoinTable = arraymonedas.find((e: any) => e.idMonedaEmpresaOdoo ==
        this.selectedCoin).name


      this.queryPerformanceRegion = this.apollo.query(
        {
          query: QIPREGION,
          variables: {
            idusuario: this.userservice.responseLogin.idUsuario,
            anio: Number(this.selectedyear),
            mes: this.selectedMonth,
            compania: this.userservice.responseLogin.companiaa[0].idCompaniaOdoo,
            monedadestino: this.selectedCoin
          },
          fetchPolicy: "network-only"
        }
      ).subscribe((response: any) => {
        if (response.data.performanceregion.listames && response.data.performanceregion.listaanual) {

          this.barChartData = [];
          this.barChartLabels = [];
          this.listamesVAR = [];
          this.listyearVAR = [];
          let listaPerformanceMes = response.data.performanceregion.listames;
          let listaPerformanceYear = response.data.performanceregion.listaanual;

          let listBarPercentaje: any = [];
          let listBarPercentajeAc: any[] = [];

          this.listaitem = [];
          this.listItemYear = [];


          listaPerformanceMes.forEach((item: any) => {
            let performance_producto = {
              region: item.nombre,
              moneda: Number(item.importeactual)
            };
            let diff: any = Number(item.importeactual) - Number(item.importeanterior);
            diff = diff.toFixed(2);
            this.listaitem.push(performance_producto);

            this.barChartLabels.push(item.nombre);
            listBarPercentaje.push(diff);
            this.fillbarchart(listBarPercentaje);

            let listVarMes = item.detalle_Receptor.lista;
            let cantidad = listVarMes.find((e: any) => e.nombreIndicador === "CANTIDAD DE VENTAS").porcentaje_Monto_Mes;
            let ventas = listVarMes.find((e: any) => e.nombreIndicador == "VENTAS").porcentaje_Monto_Mes;
            let precio = listVarMes.find((e: any) => e.nombreIndicador == "PRECIO DE VENTA PROMEDIO").porcentaje_Monto_Mes;
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
            let diffyear: any = Number(item.importeactual) - Number(item.importeanterior);
            diffyear = diffyear.toFixed(2);

            this.listItemYear.push(performance_producto_year);
            listBarPercentajeAc.push(diffyear);
            this.fillbarchartAc(listBarPercentajeAc);

            let listVarYear = item.detalle_Receptor.lista;
            let cantidadyear = listVarYear.find((e: any) => e.nombreIndicador === "CANTIDAD DE VENTAS").porcentaje_Monto_Acumulado;
            let ventasyear = listVarYear.find((e: any) => e.nombreIndicador == "VENTAS").porcentaje_Monto_Acumulado;
            let precioyear = listVarYear.find((e: any) => e.nombreIndicador == "PRECIO DE VENTA PROMEDIO").porcentaje_Monto_Acumulado;
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
    this.queryPerformanceRegion.unsubscribe();
    this.queryLogin.unsubscribe();
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



