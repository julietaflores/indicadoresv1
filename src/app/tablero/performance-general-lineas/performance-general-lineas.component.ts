import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ChartDataSets, ChartOptions, ChartType } from 'chart.js';
import { ActivatedRoute, Router } from '@angular/router';
import { Label, SingleDataSet } from 'ng2-charts';
import { BreakpointObserver } from '@angular/cdk/layout';
import { MatTableDataSource } from '@angular/material/table';
import { UserService } from 'src/app/services/user.service';
import { Apollo, QueryRef } from 'apollo-angular';
import gql from 'graphql-tag';
import { Subscription } from 'rxjs';
import { AuthServiceService } from 'src/app/services/auth-service.service';
import { GlobalConstants } from 'src/app/GLOBALS/GlobalConstants';
import { TranslateService } from '@ngx-translate/core';
import { DataIndicador } from 'src/app/models/dataIndicador.interface';

const QIPGL = gql`
query performancelineal($idusuario:Int!,$anio:Int!,$mes:String,$compania:Int!, $monedadestino:Int!) {
  performancelineal(idusuario:$idusuario,anio:$anio,mes:$mes,compania:$compania, monedadestino:$monedadestino){
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
  selector: 'app-performance-general-lineas',
  templateUrl: './performance-general-lineas.component.html',
  styleUrls: ['./performance-general-lineas.component.scss']
})
export class PerformanceGeneralLineasComponent implements OnInit {

  //queries for GraphQL
  private queryPerformanceGL: Subscription;
  private queryLogin: Subscription;

  selectedyear = String(new Date().getFullYear());
  selectedMonth = String(this.getCurrenlyMonth());
  MesActual: any = this.getCurrenlyMonth();
  selectedCoin = 0;
  selectedCoinTable: String = '';//Variable en table
  /*DataSource Month y Acumulate*/
  dataSource = new MatTableDataSource<PerformanceGL>();
  dataSourceVARS = new MatTableDataSource<VarPerformance>();
  dataSourceAc = new MatTableDataSource<PerformanceGL>();
  dataSourceVARSAc = new MatTableDataSource<VarPerformance>();

  displayedColumns: String[] = ['linea', 'moneda'];
  displayedColumnsVars: String[] = ['p_cantidad', 'p_ventas', 'p_precio'];

  placeholderYear: String = 'Year';
  placeholderMonth: String = 'Month';
  placeholderCoin: String = 'Currency';

  amoutIncremented: any;
  amoutIncrementedAc: any;

  amoutIncrementedcanvas: any;
  amoutIncrementedcanvasAc: any;

  langDefault: any = '';
  public barChartOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      yAxes: [{
        ticks: {
          fontSize: 12,

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
        color: '#ffffff',
        font: 10,
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
  public barChartColors: Array<any> = [];


  listaitem: PerformanceGL[] = [];
  listItemYear: PerformanceGL[] = [];

  listIdMes: any[] = [];
  listIdPosicionYear: any[] = [];

  listamesVAR: VarPerformance[] = [];
  newlistmes: VarPerformance[] = [];
  newlistyear: VarPerformance[] = [];
  listyearVAR: VarPerformance[] = [];


  coins: any[] = [];
  years: any[] = GlobalConstants.years;
  months: any[] = [];


  constructor(public userservice: UserService,
    private apollo: Apollo, private serviceAuth: AuthServiceService, private ruta: ActivatedRoute,
    public translate: TranslateService) {
    this.queryPerformanceGL = new Subscription();
    this.queryLogin = new Subscription();


  }




  ngOnInit(): void {

    if (this.userservice.responseLogin) {
      this.langDefault = this.userservice.responseLogin.idioma.abreviaturaIdioma;

      // alert("es dioma actual "+ this.langDefault);
      this.translate.setDefaultLang(this.langDefault);
      this.translate.use(this.langDefault);
      this.selectedCoin = this.userservice.responseLogin.companiaa[0].idMonedaEmpresaOdoo;
      this.initialSetup();


      const currentFiltros: DataIndicador = {
        anioActual: Number(this.selectedyear),
        mesActual: this.selectedMonth,
        monedaActual: this.selectedCoin

      }
      localStorage.setItem('filtroAMM', JSON.stringify(currentFiltros));

      this.queryPerformanceGL = this.apollo.watchQuery(
        {
          query: QIPGL,
          variables: {
            idusuario: this.userservice.responseLogin.idUsuario,
            anio: new Date().getFullYear(),
            mes: this.getCurrenlyMonth(),
            compania: this.userservice.responseLogin.companiaa[0].idCompaniaOdoo,
            monedadestino: this.userservice.responseLogin.companiaa[0].idMonedaEmpresaOdoo
          }
        }
      ).valueChanges.subscribe((response: any) => {
        if (response.data.performancelineal.listames && response.data.performancelineal.listaanual) {
          let listaPerformanceMes = response.data.performancelineal.listames;
          let listaPerformanceYear = response.data.performancelineal.listaanual;

          let listBarPercentaje: any = [];
          let listBarPercentajeAc: any[] = [];

          this.listaitem = [];
          this.listItemYear = [];

          this.amoutIncremented = 200 + (50 * listaPerformanceMes.length) + "px";
          this.amoutIncrementedAc = 200 + (50 * listaPerformanceYear.length) + "px";

          this.amoutIncrementedcanvas = 150 + (50 * listaPerformanceMes.length) + "px";
          this.amoutIncrementedcanvasAc = 150 + (50 * listaPerformanceYear.length) + "px";

          listaPerformanceMes.forEach((item: any) => {
            let performance_producto = {
              linea: item.nombre,
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
              linea: item.nombre,
              moneda: Number(item.importeactual)
            };
            let diffyear = Number(item.importeactual) - Number(item.importeanterior);


            this.listItemYear.push(performance_producto_year);
            listBarPercentajeAc.push(diffyear.toFixed(2));
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
          this.dataSource = new MatTableDataSource<PerformanceGL>(this.listaitem);
          this.dataSourceVARS = new MatTableDataSource<VarPerformance>(this.listamesVAR);

          this.dataSourceAc = new MatTableDataSource<PerformanceGL>(this.listItemYear);
          this.dataSourceVARSAc = new MatTableDataSource<VarPerformance>(this.listyearVAR);
        }
      }
      );
    }
    else {
      this.queryLogin = this.apollo.watchQuery({
        query: LOGIN,
        variables: { usuario: this.serviceAuth.userData?.name, clave: this.serviceAuth.userData?.password }
      }).valueChanges.subscribe((response: any) => {
       
        let filtro: DataIndicador | null | any = null;
        filtro = localStorage.getItem('filtroAMM');
        if (filtro) {
          filtro = JSON.parse(filtro);
        } else {
          filtro = null;
        }

        this.userservice.responseLogin = response.data.validarlogin;
        this.initialSetup();


        this.selectedCoin = filtro.monedaActual ;
        this.selectedyear=String(filtro.anioActual);
        this.selectedMonth=filtro.mesActual;
      
        this.queryPerformanceGL = this.apollo.watchQuery(
          {
            query: QIPGL,
            variables: {
              idusuario: this.userservice.responseLogin.idUsuario,
              anio: filtro.anioActual,
              mes: filtro.mesActual,
              compania: this.userservice.responseLogin.companiaa[0].idCompaniaOdoo,
              monedadestino: filtro.monedaActual
            }
          }
        ).valueChanges.subscribe((response: any) => {
          if (response.data.performancelineal.listames && response.data.performancelineal.listaanual) {
            this.langDefault = this.serviceAuth.userData?.language;

            this.translate.setDefaultLang(this.langDefault);
            this.translate.use(this.langDefault);

            let listaPerformanceMes = response.data.performancelineal.listames;
            let listaPerformanceYear = response.data.performancelineal.listaanual;

            this.amoutIncremented = 200 + (50 * listaPerformanceMes.length) + "px";
            this.amoutIncrementedAc = 200 + (50 * listaPerformanceYear.length) + "px";


            this.amoutIncrementedcanvas = 150 + (50 * listaPerformanceYear.length) + "px";
            this.amoutIncrementedcanvasAc = 150 + (50 * listaPerformanceYear.length) + "px";

            let listBarPercentaje: any = [];
            let listBarPercentajeAc: any[] = [];

            this.listaitem = [];
            this.listItemYear = [];


            listaPerformanceMes.forEach((item: any) => {
              let performance_producto = {
                linea: item.nombre,
                moneda: Number(item.importeactual)
              };
              let diff = Number(item.importeactual) - Number(item.importeanterior);

              this.listaitem.push(performance_producto);

              this.barChartLabels.push(item.nombre);
              listBarPercentaje.push(diff.toFixed(2));
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
                linea: item.nombre,
                moneda: Number(item.importeactual)
              };
              let diffyear = Number(item.importeactual) - Number(item.importeanterior);


              this.listItemYear.push(performance_producto_year);
              listBarPercentajeAc.push(diffyear.toFixed(2));
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
            this.dataSource = new MatTableDataSource<PerformanceGL>(this.listaitem);
            this.dataSourceVARS = new MatTableDataSource<VarPerformance>(this.listamesVAR);

            this.dataSourceAc = new MatTableDataSource<PerformanceGL>(this.listItemYear);
            this.dataSourceVARSAc = new MatTableDataSource<VarPerformance>(this.listyearVAR);
          }
        }
        );
      });

    }



  }
  private initialSetup() {

    this.months = [];

    let arraymonedas = this.userservice.responseLogin.monedass.info_moneda;
    let arrayMeses: any = this.userservice.responseLogin.mess.info_mes;

    this.selectedCoinTable = arraymonedas.find((e: any) => e.idMonedaEmpresaOdoo ==
      this.userservice.responseLogin.companiaa[0].idMonedaEmpresaOdoo).name;

    this.placeholderYear = this.userservice.responseLogin.anioo.descripcion_anio.nombre;
    this.placeholderMonth = this.userservice.responseLogin.mess.descripcion_mes.nombre;
    this.placeholderCoin = this.userservice.responseLogin.monedass.descripcion_moneda.nombre;

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
      barThickness: 40,

    };
  }
  private fillbarchartAc(listabar: any) {
    this.barChartDataAc = [];
    this.barChartColors.push({ backgroundColor: 'rgb(31,78,120)' });

    this.barChartDataAc[0] = {
      data: listabar,
      label: 'VS ' + (new Date().getFullYear() - 1),
      barThickness: 40

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
    // alert('dd '+month);
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

    //getting data from Login
    if (this.userservice.responseLogin) {
      this.months = [];
      this.barChartLabels = [];
      let arraymonedas: any = this.userservice.responseLogin.monedass.info_moneda;
      this.selectedCoinTable = arraymonedas.find((e: any) => e.idMonedaEmpresaOdoo ==
        this.selectedCoin).name

      let arrayMeses: any = this.userservice.responseLogin.mess.info_mes;
      this.placeholderYear = this.userservice.responseLogin.anioo.descripcion_anio.nombre;
      this.placeholderMonth = this.userservice.responseLogin.mess.descripcion_mes.nombre;
      this.placeholderCoin = this.userservice.responseLogin.monedass.descripcion_moneda.nombre;

      arrayMeses.forEach((item: any) => {
        const mes = {
          value: String(item.mesid),
          viewValue: item.nombre
        }
        this.months.push(mes);
      });

      this.queryPerformanceGL = this.apollo.watchQuery(
        {
          query: QIPGL,
          variables: {
            idusuario: this.userservice.responseLogin.idUsuario,
            anio: Number(this.selectedyear),
            mes: this.selectedMonth,
            compania: this.userservice.responseLogin.companiaa[0].idCompaniaOdoo,
            monedadestino: this.selectedCoin
          }
        }
      ).valueChanges.subscribe((response: any) => {
        if (response.data.performancelineal.listames && response.data.performancelineal.listaanual) {



          //alert('id mes '+this.selectedMonth);

          this.barChartData = [];
          this.barChartLabels = [];
          this.listamesVAR = [];
          this.listyearVAR = [];
          let listaPerformanceMes = response.data.performancelineal.listames;
          let listaPerformanceYear = response.data.performancelineal.listaanual;

          let listBarPercentaje: any = [];
          let listBarPercentajeAc: any[] = [];

          this.listaitem = [];
          this.listItemYear = [];


          listaPerformanceMes.forEach((item: any) => {
            let performance_producto = {
              linea: item.nombre,
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
              linea: item.nombre,
              moneda: Number(item.importeactual)
            };
            let diffyear: any = Number(item.importeactual) - Number(item.importeanterior);
            diffyear = diffyear.toFixed(2);

            this.listItemYear.push(performance_producto_year);
            listBarPercentajeAc.push(diffyear);
            this.fillbarchartAc(listBarPercentajeAc);

            let listVarYear = item.detalle_Receptor.lista;
            let cantidadyear = listVarYear.find((e: any) => e.nombreIndicador === "CANTIDAD DE VENTAS").porcentaje_Monto_Acumulado;
            let ventasyear = listVarYear.find((e: any) => e.nombreIndicador == "VENTAS").porcentaje_Monto_Mes;
            let precioyear = listVarYear.find((e: any) => e.nombreIndicador == "PRECIO DE VENTA PROMEDIO").porcentaje_Monto_Acumulado;
            let topvarYear = {
              p_cantidad: Number(cantidadyear.replace(',', '.')),
              p_ventas: Number(ventasyear.replace(',', '.')),
              p_precio: Number(precioyear.replace(',', '.'))

            }
            this.listyearVAR.push(topvarYear);
          });
          this.dataSource = new MatTableDataSource<PerformanceGL>(this.listaitem);
          this.dataSourceVARS = new MatTableDataSource<VarPerformance>(this.listamesVAR);

          this.dataSourceAc = new MatTableDataSource<PerformanceGL>(this.listItemYear);
          this.dataSourceVARSAc = new MatTableDataSource<VarPerformance>(this.listyearVAR);
        }
      }
      );

    }
  }
  ngOnDestroy(): void {
    this.queryPerformanceGL.unsubscribe();
    this.queryLogin.unsubscribe();
  }


}

export interface PerformanceGL {
  linea: string;
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