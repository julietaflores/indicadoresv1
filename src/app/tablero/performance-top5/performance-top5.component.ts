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
import { GlobalConstants } from 'src/app/GLOBALS/GlobalConstants';
import { TranslateService } from '@ngx-translate/core';
import { DataIndicador } from 'src/app/models/dataIndicador.interface';

const QIPTOP5 = gql`
query performancetop5($idusuario:Int!,$anio:Int!,$mes:String,$compania:Int!, $monedadestino:Int!) {
  performancetop5(idusuario:$idusuario,anio:$anio,mes:$mes,compania:$compania, monedadestino:$monedadestino){
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
  selector: 'app-performance-top5',
  templateUrl: './performance-top5.component.html',
  styleUrls: ['./performance-top5.component.scss']
})
export class PerformanceTop5Component implements OnInit {

  //queries for GraphQL
  private queryPerformanceTop5: Subscription;
  private queryLogin: Subscription;

  constructor(public userservice: UserService,
    private apollo: Apollo, private serviceAuth: AuthServiceService,
    public translateService: TranslateService) {

    this.queryPerformanceTop5 = new Subscription();
    this.queryLogin = new Subscription();
  }

  selectedyear = String(new Date().getFullYear());
  selectedMonth = String(this.getCurrenlyMonth());
  MesActual: any = this.getCurrenlyMonth();

  selectedCoin = 0;
  selectedCoinTable: String = '';//Variable en table
  /*DataSource Month y Acumulate*/

  amoutIncremented: any;
  amoutIncrementedcanvas: any;
  amoutIncrementedAc: any;
  amoutIncrementedcanvasAc: any;

  dataSource = new MatTableDataSource<PerformanceTopFive>();
  dataSourceVARS = new MatTableDataSource<TopVar>();
  dataSourceAc = new MatTableDataSource<PerformanceTopFive>();
  dataSourceVARSAc = new MatTableDataSource<TopVar>();

  placeholderYear: String = 'Year';
  placeholderMonth: String = 'Month';
  placeholderCoin: String = 'Currency';

  displayedColumns: String[] = ['conta', 'producto', 'us'];
  displayedColumnsMesVars: String[] = ['p_cantidad', 'p_ventas', 'p_precio'];

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
          fontSize: 12
        }
      }],
    },
    plugins: {
      datalabels: {
        color: 'red',
        display: true,
        
        anchor: 'center',
        align: 'start',
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
  public barChartDataAc: any[] = [];
  public barChartColors: Array<any> = [{ backgroundColor: 'rgb(31,78,120)' }];


  langDefault: any = '';

  listaitem: PerformanceTopFive[] = [];
  listItemYear: PerformanceTopFive[] = [];

  listBarPercentaje: any[] = [];
  listBarPercentajeAc: any[] = [];

  listamesVAR: TopVar[] = [];
  listyearVAR: TopVar[] = [];

  coins: any[] = [];
  years: any[] = GlobalConstants.years;
  months: any[] = [];


  ngOnInit(): void {

    if (this.userservice.responseLogin) {
      this.selectedCoin = this.userservice.responseLogin.companiaa[0].idMonedaEmpresaOdoo;
      this.setup();

      const currentFiltros: DataIndicador = {
        anioActual: Number(this.selectedyear),
        mesActual: this.selectedMonth,
        monedaActual: this.selectedCoin

      }
      localStorage.setItem('filtroAMM', JSON.stringify(currentFiltros));

      this.queryPerformanceTop5 = this.apollo.watchQuery({
        query: QIPTOP5,
        variables: {
          idusuario: this.userservice.responseLogin.idUsuario,
          anio: new Date().getFullYear(),
          mes: this.getCurrenlyMonth(),
          compania: this.userservice.responseLogin.companiaa[0].idCompaniaOdoo,
          monedadestino: this.userservice.responseLogin.companiaa[0].idMonedaEmpresaOdoo
        }
      }).valueChanges.subscribe((response: any) => {

        if (response.data.performancetop5.listames && response.data.performancetop5.listaanual) {

          let listaPerformanceMes = response.data.performancetop5.listames;
          let listaPerformanceYear = response.data.performancetop5.listaanual;


          this.amoutIncremented = 200 + (50 * listaPerformanceMes.length) + "px";
          this.amoutIncrementedAc = 200 + (50 * listaPerformanceYear.length) + "px";

          this.amoutIncrementedcanvas = 150 + (50 * listaPerformanceMes.length) + "px";
          this.amoutIncrementedcanvasAc = 150 + (50 * listaPerformanceYear.length) + "px";



          this.listBarPercentaje = [];
          this.listBarPercentajeAc = [];

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

            this.listBarPercentaje.push(diff.toFixed(2));
            this.barChartColors.push({ backgroundColor: 'rgb(31,78,120)' });
            this.barChartLabels.push(listaPerformanceMes[i].nombre);

            this.barChartData[0] = {
              data: this.listBarPercentaje,
              label: 'VS ' + (new Date().getFullYear() - 1),

            };

            this.listaitem.push(performance_producto);

            let listVarMes = listaPerformanceMes[i].detalle_Receptor.lista;
            let cantidad = listVarMes.find((e: any) => e.nombreIndicador === "CANTIDAD DE VENTAS").porcentaje_Monto_Mes;
            let ventas = listVarMes.find((e: any) => e.nombreIndicador == "VENTAS").porcentaje_Monto_Mes;
            let precio = listVarMes.find((e: any) => e.nombreIndicador == "PRECIO DE VENTA PROMEDIO").porcentaje_Monto_Mes;

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
            this.listItemYear.push(performance_producto_year);
            let diffyear = Number(listaPerformanceYear[j].importeactual) -
              Number(listaPerformanceYear[j].importeanterior);

            this.listBarPercentajeAc.push(diffyear.toFixed(2));

            if (listaPerformanceMes.length === 0) {
              this.barChartLabels.push(listaPerformanceYear[j].nombre);
            }

            this.barChartDataAc[0] = {
              data: this.listBarPercentajeAc,
              label: 'VS ' + (new Date().getFullYear() - 1),

            };

            this.barChartColors.push({ backgroundColor: 'rgb(31,78,120)' });




            let listVarYear = listaPerformanceYear[j].detalle_Receptor.lista;
            let cantidadyear = listVarYear.find((e: any) => e.nombreIndicador === "CANTIDAD DE VENTAS").porcentaje_Monto_Acumulado;
            let ventasyear = listVarYear.find((e: any) => e.nombreIndicador == "VENTAS").porcentaje_Monto_Acumulado;
            let precioyear = listVarYear.find((e: any) => e.nombreIndicador == "PRECIO DE VENTA PROMEDIO").porcentaje_Monto_Acumulado;
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
    else {
      this.queryLogin = this.apollo.watchQuery({
        query: LOGIN,
        variables: { usuario: this.serviceAuth.userData?.name, clave: this.serviceAuth.userData?.password }
      }).valueChanges.subscribe((response: any) => {
        this.userservice.responseLogin = response.data.validarlogin;

        this.langDefault = this.userservice.responseLogin.idioma.abreviaturaIdioma;

        // alert("es dioma actual "+ this.langDefault);
        this.translateService.setDefaultLang(this.langDefault);
        this.translateService.use(this.langDefault);

        let filtro:DataIndicador| null | any = null;
        filtro = localStorage.getItem('filtroAMM');
        if (filtro) {
          filtro = JSON.parse(filtro);
        } else {
          filtro = null;
        }
        this.selectedCoin = filtro.monedaActual ;
        this.selectedyear=String(filtro.anioActual);
        this.selectedMonth=filtro.mesActual;
        let arrayMeses: any = this.userservice.responseLogin.mess.info_mes;
        let arraymonedas = this.userservice.responseLogin.monedass.info_moneda;
        this.placeholderYear = this.userservice.responseLogin.anioo.descripcion_anio.nombre;
        this.placeholderMonth = this.userservice.responseLogin.mess.descripcion_mes.nombre;
        this.placeholderCoin = this.userservice.responseLogin.monedass.descripcion_moneda.nombre;


        this.selectedCoinTable = arraymonedas.find((e: any) => e.idMonedaEmpresaOdoo ==
          this.userservice.responseLogin.companiaa[0].idMonedaEmpresaOdoo).name;

        arraymonedas.forEach((e: any) => {
          let coin = {
            value: e.idMonedaEmpresaOdoo,
            viewValue: e.name
          };
          this.coins.push(coin);
        });
        arrayMeses.forEach((item: any) => {
          const mes = {
            value: String(item.mesid),
            viewValue: item.nombre
          }
          this.months.push(mes);
        });
        this.queryPerformanceTop5 = this.apollo.watchQuery({
          query: QIPTOP5,
          variables: {
            idusuario: this.userservice.responseLogin.idUsuario,
            anio: filtro.anioActual,
            mes: filtro.mesActual,
            compania: this.userservice.responseLogin.companiaa[0].idCompaniaOdoo,
            monedadestino: filtro.monedaActual
          }
        }).valueChanges.subscribe((response: any) => {

          if (response.data.performancetop5.listames && response.data.performancetop5.listaanual) {
            let listaPerformanceMes = response.data.performancetop5.listames;
            let listaPerformanceYear = response.data.performancetop5.listaanual;


            this.amoutIncremented = 200 + (50 * listaPerformanceMes.length) + "px";
            this.amoutIncrementedAc = 200 + (50 * listaPerformanceYear.length) + "px";

            this.amoutIncrementedcanvas = 150 + (50 * listaPerformanceMes.length) + "px";
            this.amoutIncrementedcanvasAc = 150 + (50 * listaPerformanceYear.length) + "px";


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

              listBarPercentaje.push(diff.toFixed(2));
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
              let precio = listVarMes.find((e: any) => e.nombreIndicador == "PRECIO DE VENTA PROMEDIO").porcentaje_Monto_Mes;

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
              let diffyear = Number(listaPerformanceYear[j].importeactual) -
                Number(listaPerformanceYear[j].importeanterior);

              this.barChartColors.push({ backgroundColor: 'rgb(31,78,120)' });
              listBarPercentajeAc.push(diffyear.toFixed(2));

              if (listaPerformanceMes.length === 0) {
                this.barChartLabels.push(listaPerformanceYear[j].nombre);
              }

              this.listItemYear.push(performance_producto_year);

              let listVarYear = listaPerformanceYear[j].detalle_Receptor.lista;
              let cantidadyear = listVarYear.find((e: any) => e.nombreIndicador === "CANTIDAD DE VENTAS").porcentaje_Monto_Acumulado;
              let ventasyear = listVarYear.find((e: any) => e.nombreIndicador == "VENTAS").porcentaje_Monto_Acumulado;
              let precioyear = listVarYear.find((e: any) => e.nombreIndicador == "PRECIO DE VENTA PROMEDIO").porcentaje_Monto_Acumulado;
              let topvarYear = {
                p_cantidad: Number(cantidadyear.replace(',', '.')),
                p_ventas: Number(ventasyear.replace(',', '.')),
                p_precio: Number(precioyear.replace(',', '.'))

              }
              this.listyearVAR.push(topvarYear);


            }

            this.barChartDataAc[0] = {
              data: listBarPercentajeAc,
              label: 'VS ' + (new Date().getFullYear() - 1),

            };
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
  getTotalCostAc() {
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
    const currentFiltros: DataIndicador = {
      anioActual: Number(this.selectedyear),
      mesActual: this.selectedMonth,
      monedaActual: this.selectedCoin

    }
    localStorage.removeItem('filtroAMM');
    localStorage.setItem('filtroAMM', JSON.stringify(currentFiltros));
    if (this.userservice.responseLogin) {
      this.months = [];
      this.barChartLabels = [];
      this.coins = [];
      let arraymonedas = this.userservice.responseLogin.monedass.info_moneda;
      let arrayMeses: any = this.userservice.responseLogin.mess.info_mes;
      this.selectedCoinTable = arraymonedas.find((e: any) => e.idMonedaEmpresaOdoo ==
        this.selectedCoin).name


      arraymonedas.forEach((e: any) => {
        let coin = {
          value: e.idMonedaEmpresaOdoo,
          viewValue: e.name
        };
        this.coins.push(coin);
      });
      arrayMeses.forEach((item: any) => {
        const mes = {
          value: String(item.mesid),
          viewValue: item.nombre
        }
        this.months.push(mes);
      });

      this.queryPerformanceTop5 = this.apollo.watchQuery({
        query: QIPTOP5,
        variables: {
          idusuario: this.userservice.responseLogin.idUsuario,
          anio: Number(this.selectedyear),
          mes: this.selectedMonth,
          compania: this.userservice.responseLogin.companiaa[0].idCompaniaOdoo,
          monedadestino: this.selectedCoin
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
          this.amoutIncremented = 200 + (50 * listaPerformanceMes.length) + "px";
          this.amoutIncrementedAc = 200 + (50 * listaPerformanceYear.length) + "px";

          this.amoutIncrementedcanvas = 150 + (50 * listaPerformanceMes.length) + "px";
          this.amoutIncrementedcanvasAc = 150 + (50 * listaPerformanceYear.length) + "px";

          for (let i: number = 0; i < listaPerformanceMes.length; i++) {
            let performance_producto = {
              'conta': i + 1,
              'producto': listaPerformanceMes[i].nombre,
              'us': Number(listaPerformanceMes[i].importeactual)
            };

            let diff = Number(listaPerformanceMes[i].importeactual) -
              Number(listaPerformanceMes[i].importeanterior);

            listBarPercentaje.push(diff.toFixed(2));
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
            let precio = listVarMes.find((e: any) => e.nombreIndicador == "PRECIO DE VENTA PROMEDIO").porcentaje_Monto_Mes;

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
            let diffyear = Number(listaPerformanceYear[j].importeactual) -
              Number(listaPerformanceYear[j].importeanterior);

            this.barChartColors.push({ backgroundColor: 'rgb(31,78,120)' });
            listBarPercentajeAc.push(diffyear.toFixed(2));

            if (listaPerformanceMes.length === 0) {
              this.barChartLabels.push(listaPerformanceYear[j].nombre);
            }

            this.listItemYear.push(performance_producto_year);

            let listVarYear = listaPerformanceYear[j].detalle_Receptor.lista;
            let cantidadyear = listVarYear.find((e: any) => e.nombreIndicador === "CANTIDAD DE VENTAS").porcentaje_Monto_Acumulado;
            let ventasyear = listVarYear.find((e: any) => e.nombreIndicador == "VENTAS").porcentaje_Monto_Acumulado;
            let precioyear = listVarYear.find((e: any) => e.nombreIndicador == "PRECIO DE VENTA PROMEDIO").porcentaje_Monto_Acumulado;
            let topvarYear = {
              p_cantidad: Number(cantidadyear.replace(',', '.')),
              p_ventas: Number(ventasyear.replace(',', '.')),
              p_precio: Number(precioyear.replace(',', '.'))

            }
            this.listyearVAR.push(topvarYear);


          }

          this.barChartDataAc[0] = {
            data: listBarPercentajeAc,
            label: 'VS ' + (new Date().getFullYear() - 1),

          };
          this.dataSource = new MatTableDataSource<PerformanceTopFive>(this.listaitem);
          this.dataSourceVARS = new MatTableDataSource<TopVar>(this.listamesVAR);

          this.dataSourceAc = new MatTableDataSource<PerformanceTopFive>(this.listItemYear);
          this.dataSourceVARSAc = new MatTableDataSource<TopVar>(this.listyearVAR);




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
  setup() {

    this.placeholderYear = this.userservice.responseLogin.anioo.descripcion_anio.nombre;
    this.placeholderMonth = this.userservice.responseLogin.mess.descripcion_mes.nombre;
    this.placeholderCoin = this.userservice.responseLogin.monedass.descripcion_moneda.nombre;

    this.langDefault = this.userservice.responseLogin.idioma.abreviaturaIdioma;

    this.translateService.setDefaultLang(this.langDefault);
    this.translateService.use(this.langDefault);

    let arraymonedas = this.userservice.responseLogin.monedass.info_moneda;
    let arrayMeses: any = this.userservice.responseLogin.mess.info_mes;
    this.selectedCoinTable = arraymonedas.find((e: any) => e.idMonedaEmpresaOdoo ==
      this.userservice.responseLogin.companiaa[0].idMonedaEmpresaOdoo).name;

    arraymonedas.forEach((e: any) => {
      let coin = {
        value: e.idMonedaEmpresaOdoo,
        viewValue: e.name
      };
      this.coins.push(coin);
    });
    arrayMeses.forEach((item: any) => {
      const mes = {
        value: String(item.mesid),
        viewValue: item.nombre
      }
      this.months.push(mes);
    });
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
