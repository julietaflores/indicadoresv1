import { Component, OnInit } from '@angular/core';
import { ChartEvent } from 'ng-chartist';
import { ChartDataSets, ChartOptions, ChartType } from 'chart.js';
import { Color, Label, SingleDataSet } from 'ng2-charts';
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
import { Router } from '@angular/router';
import { UserAuth } from 'src/app/models/userAuth.interface';
import { pageinf } from 'src/app/models/pageinfoo';
import { GraphqlServiceService } from 'src/app/services/graphql-service.service';

@Component({
  selector: 'app-performance-top5',
  templateUrl: './performance-top5.component.html',
  styleUrls: ['./performance-top5.component.scss']
})
export class PerformanceTop5Component implements OnInit {

  //queries for GraphQL
  private queryPerformanceTop5: Subscription;
  private queryLogin: Subscription;
  userData_aux: UserAuth | null = null;


  constructor(public userservice: UserService,
    private serviceAuth: AuthServiceService,
    public translateService: TranslateService, public translate: TranslateService,
    private route: Router,private serviceGraphql: GraphqlServiceService) {

    this.queryPerformanceTop5 = new Subscription();
    this.queryLogin = new Subscription();
    this.route.routeReuseStrategy.shouldReuseRoute = () => false;

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
        color: 'black',
        font: {
          weight: "bold",
          size: 10
        },
        anchor: 'end',
        display: true,
        align: 'center',
        padding: function (labor_anc: number) {
          labor_anc = screen.width;
          console.log('cc ' + labor_anc);

          switch (true) {
            case (labor_anc >= 320) && (labor_anc <= 575):
              console.log('modo celular');
              return 5;
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
                return 30;
                break;
              
            case (labor_anc >= 1440):
              console.log('modo celular version 4');
              return 32;
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
  public barChartLabelsAc: string[] = [];
  public barChartType = 'horizontalBar';
  public barChartLegend = true;

  //barchart region
  public barChartData: any[] = [];
  //barchart region acumulado
  public barChartDataAc: any[] = [];


  //filtro: DataIndicador | null | any = null;
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

 
      (<HTMLHeadingElement>document.getElementById("tit")).innerHTML='';     

      this.userData_aux= this.serviceAuth.Obtener_ls_authuser();
    
      this.langDefault = this.userData_aux?.language;
      this.translate.setDefaultLang(this.langDefault);
      this.translate.use(this.langDefault);

      this.selectedCoin = this.userData_aux?.ls_idMonedaOdoo;
    
      this.initialSetup();

      const currentFiltros: DataIndicador = {
        anioActual: Number(this.selectedyear),
        mesActual: this.selectedMonth,
        monedaActual: this.selectedCoin

      }


      let menuCT: any = localStorage.getItem('menuCT');
      menuCT = JSON.parse(menuCT);
      console.log(menuCT);

      localStorage.setItem('filtroAMM', JSON.stringify(currentFiltros));

      this.queryPerformanceTop5 = this.serviceGraphql.getPerformanceTop5(this.userData_aux?.idUsuario,
        this.userData_aux?.companiaId,menuCT.categoriacompaniaid,menuCT.idtablero,
        new Date().getFullYear(),this.getCurrenlyMonth(),this.selectedCoin).
        valueChanges.subscribe((response: any) => {

        if (response.data.performancetop5.listames && response.data.performancetop5.listaanual) {


          localStorage.removeItem('titulo_izquierdo');
          const pageinf: pageinf = {
            title:response.data.performancetop5.tablero.nombreTablero
          }
          //alert(JSON.stringify(pageinf));
          localStorage.setItem('titulo_izquierdo', JSON.stringify(pageinf));

          (<HTMLHeadingElement>document.getElementById("tit")).innerHTML = response.data.performancetop5.tablero.nombreTablero;


          let listaPerformanceMes = response.data.performancetop5.listames;
          let listaPerformanceYear = response.data.performancetop5.listaanual;

          this.getSizeCanvas(listaPerformanceMes, listaPerformanceYear);

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

            let diff = Number(listaPerformanceMes[i].importeactual) - Number(listaPerformanceMes[i].importeanterior);
            this.listBarPercentaje.push(diff.toFixed(2));
            this.barChartLabels.push(listaPerformanceMes[i].nombre);

            this.barChartData[0] = {
              data: this.listBarPercentaje,
              label: 'VS ' + (new Date().getFullYear() - 1),
              backgroundColor: '#F08B3B',
              hoverBackgroundColor: '#F08B3B',
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


            let diffyear = Number(listaPerformanceYear[j].importeactual) - Number(listaPerformanceYear[j].importeanterior);
            this.listBarPercentajeAc.push(diffyear.toFixed(2));
            this.barChartLabelsAc.push(listaPerformanceYear[j].nombre);
            this.barChartDataAc[0] = {
              data: this.listBarPercentajeAc,
              label: 'VS ' + (new Date().getFullYear() - 1),
              backgroundColor: '#F08B3B',
              hoverBackgroundColor: '#F08B3B',
            };



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


      this.userData_aux= null;

      this.userData_aux= this.serviceAuth.Obtener_ls_authuser();
      this.selectedCoin = this.userData_aux?.ls_idMonedaOdoo;     
      //this.idUsuario_aux= this.userData_aux?.idUsuario;
      // this.companiaId_aux= this.userData_aux?.companiaId;

      // const currentFiltros: DataIndicador = {
      //   anioActual: Number(this.selectedyear),
      //   mesActual: this.selectedMonth,
      //   monedaActual: this.selectedCoin
      // }


      let menuCT: any = localStorage.getItem('menuCT');
      menuCT = JSON.parse(menuCT);

      // localStorage.setItem('filtroAMM', JSON.stringify(currentFiltros));
      this.queryLogin = this.serviceGraphql.postLogin(this.serviceAuth.userData?.name,
        this.serviceAuth.userData?.password).
        valueChanges.subscribe((response: any) => {

        let filtro: DataIndicador | null | any = null;
        filtro = localStorage.getItem('filtroAMM');
        if (filtro) {
          filtro = JSON.parse(filtro);
        } else {
         filtro = null;
        }


        this.userservice.responseLogin = response.data.validarlogin;
        this.selectedCoin = filtro.monedaActual;
        this.selectedyear = String(filtro.anioActual);
        this.selectedMonth = filtro.mesActual;

        this.initialSetup();
        this.langDefault = this.serviceAuth.userData?.language;
        this.translateService.setDefaultLang(this.langDefault);
        this.translateService.use(this.langDefault);
     
        this.queryPerformanceTop5 = this.serviceGraphql.getPerformanceTop5(this.userData_aux?.idUsuario,
          this.userData_aux?.companiaId,menuCT.categoriacompaniaid,menuCT.idtablero,filtro.anioActual
          ,filtro.mesActual,filtro.monedaActual).
          valueChanges.subscribe((response: any) => {

          if (response.data.performancetop5.listames && response.data.performancetop5.listaanual) {

            localStorage.removeItem('titulo_izquierdo');
            const pageinf: pageinf = {
              title:response.data.performancetop5.tablero.nombreTablero
            }
            //alert(JSON.stringify(pageinf));
            localStorage.setItem('titulo_izquierdo', JSON.stringify(pageinf));
  
            (<HTMLHeadingElement>document.getElementById("tit")).innerHTML = response.data.performancetop5.tablero.nombreTablero;



            let listaPerformanceMes = response.data.performancetop5.listames;
            let listaPerformanceYear = response.data.performancetop5.listaanual;

            this.getSizeCanvas(listaPerformanceMes, listaPerformanceYear);


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



              let diff = Number(listaPerformanceMes[i].importeactual) - Number(listaPerformanceMes[i].importeanterior);
              listBarPercentaje.push(diff.toFixed(2));
              this.barChartLabels.push(listaPerformanceMes[i].nombre);
              this.barChartData[0] = {
                data: listBarPercentaje,
                label: 'VS ' + (filtro.anioActual - 1),
                backgroundColor: '#F08B3B',
                hoverBackgroundColor: '#F08B3B',
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

              let diffyear = Number(listaPerformanceYear[j].importeactual) - Number(listaPerformanceYear[j].importeanterior);
              listBarPercentajeAc.push(diffyear.toFixed(2));
              this.barChartLabelsAc.push(listaPerformanceYear[j].nombre);
              this.barChartDataAc[0] = {
                data: listBarPercentajeAc,
                label: 'VS ' + (filtro.anioActual - 1),
                backgroundColor: '#F08B3B',
                hoverBackgroundColor: '#F08B3B',
              };


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


      });
    }

  }
  getSizeCanvas(listaPerformanceMes: any, listaPerformanceYear: any) {

    this.amoutIncremented = 180 + (50 * listaPerformanceMes.length) + "px";
    this.amoutIncrementedAc = 180 + (50 * listaPerformanceYear.length) + "px";

    this.amoutIncrementedcanvas = 150 + (50 * listaPerformanceMes.length) + "px";
    this.amoutIncrementedcanvasAc = 150 + (50 * listaPerformanceYear.length) + "px";
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

    let menuCT: any = localStorage.getItem('menuCT');
    menuCT = JSON.parse(menuCT);

    localStorage.removeItem('filtroAMM');
    localStorage.setItem('filtroAMM', JSON.stringify(currentFiltros));


    let filtro: DataIndicador | null | any = null;
    filtro = localStorage.getItem('filtroAMM');
        if (filtro) {
          filtro = JSON.parse(filtro);
        } else {
         filtro = null;
        }
    this.listaitem = [];
    this.listItemYear = [];
    this.listamesVAR = [];
    this.listyearVAR = [];
    if (this.userservice.responseLogin) {

      this.months = [];
      this.barChartLabels = [];
      this.barChartLabelsAc = [];
      this.coins = [];
      let arraymonedas: any;


      for (let listac of this.userservice.responseLogin.companiaa){
  
        if(listac.idCompania==this.userData_aux?.companiaId){
    
          arraymonedas = listac.monedass.info_moneda;
          this.placeholderCoin = listac.monedass.descripcion_moneda.nombre;
      
         this.selectedCoinTable = arraymonedas.find((e: any) => e.idMonedaOdoo == 
         this.selectedCoin).name;
    
          let arrayMeses: any = this.userservice.responseLogin.mess.info_mes;
          this.placeholderYear = this.userservice.responseLogin.anioo.descripcion_anio.nombre;
          this.placeholderMonth = this.userservice.responseLogin.mess.descripcion_mes.nombre;
      
          arraymonedas.forEach((e: any) => {
            let coin = {
              value: e.idMonedaOdoo,
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


      this.queryPerformanceTop5 = this.serviceGraphql.getPerformanceTop5(this.userData_aux?.idUsuario,
        this.userData_aux?.companiaId,menuCT.categoriacompaniaid,menuCT.idtablero,Number(this.selectedyear),
        this.selectedMonth,this.selectedCoin).
        valueChanges.subscribe((response: any) => {
        // console.log(response);
        if (response) {

          this.barChartData = [];
          this.listamesVAR = [];
          this.listyearVAR = [];
          if (response.data.performancetop5.listames && response.data.performancetop5.listaanual) {


            localStorage.removeItem('titulo_izquierdo');
            const pageinf: pageinf = {
              title:response.data.performancetop5.tablero.nombreTablero
            }
            //alert(JSON.stringify(pageinf));
            localStorage.setItem('titulo_izquierdo', JSON.stringify(pageinf));
  
            (<HTMLHeadingElement>document.getElementById("tit")).innerHTML = response.data.performancetop5.tablero.nombreTablero;
  

            let listaPerformanceMes = response.data.performancetop5.listames;
            let listaPerformanceYear = response.data.performancetop5.listaanual;
            this.getSizeCanvas(listaPerformanceMes, listaPerformanceYear);

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

              let diff = Number(listaPerformanceMes[i].importeactual) - Number(listaPerformanceMes[i].importeanterior);
              listBarPercentaje.push(diff.toFixed(2));
              this.barChartLabels.push(listaPerformanceMes[i].nombre);
              this.barChartData[0] = {
                data: listBarPercentaje,
                label: 'VS ' + (filtro.anioActual - 1),
                backgroundColor: '#F08B3B',
                hoverBackgroundColor: '#F08B3B',
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

              let diffyear = Number(listaPerformanceYear[j].importeactual) - Number(listaPerformanceYear[j].importeanterior);
              listBarPercentajeAc.push(diffyear.toFixed(2));

              this.barChartLabelsAc.push(listaPerformanceYear[j].nombre);
              this.barChartDataAc[0] = {
                data: listBarPercentajeAc,
                label: 'VS ' + (Number(this.selectedyear) - 1),
                backgroundColor: '#F08B3B',
                hoverBackgroundColor: '#F08B3B',
              };



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

      },
        (error: any) => {
          console.log(error);
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

  private initialSetup() {
    this.months = [];
    this.coins = [];
    let arraymonedas: any;


    for (let listac of this.userservice.responseLogin.companiaa){

      if(listac.idCompania==this.userData_aux?.companiaId){
  
        arraymonedas = listac.monedass.info_moneda;
        this.placeholderCoin = listac.monedass.descripcion_moneda.nombre;
        this.selectedCoinTable = arraymonedas.find((e: any) => e.idMonedaOdoo ==
        this.selectedCoin).name;
        // this.selectedCoinTable = arraymonedas.find((e: any) => e.idMonedaOdoo ==
        // this.userservice.responseLogin.companiaa[0].idMonedaOdoo).name;

        let arrayMeses: any = this.userservice.responseLogin.mess.info_mes;
        this.placeholderYear = this.userservice.responseLogin.anioo.descripcion_anio.nombre;
        this.placeholderMonth = this.userservice.responseLogin.mess.descripcion_mes.nombre;
  
        arraymonedas.forEach((e: any) => {
          let coin = {
            value: e.idMonedaOdoo,
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
