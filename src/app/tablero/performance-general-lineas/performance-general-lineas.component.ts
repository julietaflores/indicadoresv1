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
import { UserAuth } from 'src/app/models/userAuth.interface';
import { pageinf } from 'src/app/models/pageinfoo';

const QIPGL = gql`
query performancelineal($idusuario:Int!,$companiaid:Int!,$categoriacompaniaid:Int!,$tableroid:Int!,$anio:Int!,$mes:String, $monedadestino:Int!) {
  performancelineal(idusuario:$idusuario,companiaid:$companiaid,categoriacompaniaid:$categoriacompaniaid,tableroid:$tableroid,anio:$anio,mes:$mes,monedadestino:$monedadestino){
    tablero{
      idTablero
      nombreTablero
      estadoTablero
      urlTablero   
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
    fechacreacionusuario
    codIdioma
    estado
    idEmpresa
   
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
   

   companiaa{
     idCompania
     idEmpresa
      idCompaniaOdoo
       name
     idMonedaOdoo
     imagenUrl
     estado
        monedass{
     descripcion_moneda{
       auxiliarId
       nombre
       
     }
     info_moneda{
        monedaId
     idMonedaOdoo
     name
     symbol
     rate
     estado
     }
    
     
   }
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

  //Variables seleccionadas por defecto
  selectedyear = String(new Date().getFullYear());
  selectedMonth = String(this.getCurrenlyMonth());
  MesActual: any = this.getCurrenlyMonth();
  selectedCoin = 0;
  selectedCoinTable: String = '';

  //
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

  listaitem: PerformanceGL[] = [];
  listItemYear: PerformanceGL[] = [];

  listIdMes: any[] = [];
  listIdPosicionYear: any[] = [];

  listamesVAR: VarPerformance[] = [];
  newlistmes: VarPerformance[] = [];
  newlistyear: VarPerformance[] = [];
  listyearVAR: VarPerformance[] = [];

  idUsuario_aux:any|undefined|0;
  companiaId_aux:any| undefined|0;
  coins: any[] = [];
  years: any[] = GlobalConstants.years;
  months: any[] = [];
  userData_aux: UserAuth | null = null;

  constructor(public userservice: UserService,
    private apollo: Apollo, private serviceAuth: AuthServiceService, private ruta: ActivatedRoute,
    public translate: TranslateService, private route: Router) {
    this.queryPerformanceGL = new Subscription();
    this.queryLogin = new Subscription();

    this.route.routeReuseStrategy.shouldReuseRoute = () => false;


  }




  ngOnInit(): void {

    if (this.userservice.responseLogin) {

      (<HTMLHeadingElement>document.getElementById("tit")).innerHTML='';     

      this.userData_aux= this.serviceAuth.Obtener_ls_authuser();
      console.log('list cifra notables inicio'+ JSON.stringify(this.userData_aux));
      console.log('variable inicio'+ JSON.stringify(this.userData_aux?.ls_idMonedaOdoo));

      this.langDefault = this.userData_aux?.language;
      this.translate.setDefaultLang(this.langDefault);
      this.translate.use(this.langDefault);

      //this.selectedCoin = this.userservice.responseLogin.companiaa[0].idMonedaEmpresaOdoo;
      this.initialSetup();

      this.selectedCoin = this.userData_aux?.ls_idMonedaOdoo;

      this.idUsuario_aux= this.userData_aux?.idUsuario;
      this.companiaId_aux= this.userData_aux?.companiaId;


      const currentFiltros: DataIndicador = {
        anioActual: Number(this.selectedyear),
        mesActual: this.selectedMonth,
        monedaActual: this.selectedCoin

      }

      let menuCT: any = localStorage.getItem('menuCT');
      menuCT = JSON.parse(menuCT);
      console.log(menuCT);


      localStorage.setItem('filtroAMM', JSON.stringify(currentFiltros));

      this.queryPerformanceGL = this.apollo.watchQuery(
        {
          query: QIPGL,
          variables: {
      

            idusuario: this.idUsuario_aux,
            companiaid:this.companiaId_aux,
            categoriacompaniaid:menuCT.categoriacompaniaid,
            tableroid:menuCT.idtablero,
            anio: new Date().getFullYear(),
            mes: this.getCurrenlyMonth(),
            monedadestino: this.selectedCoin


          }
        }
      ).valueChanges.subscribe((response: any) => {
        if (response.data.performancelineal.listames && response.data.performancelineal.listaanual) {


          localStorage.removeItem('Titulo_isquierdo');
          const pageinf: pageinf = {
            title:response.data.performancelineal.tablero.nombreTablero
          }
          //alert(JSON.stringify(pageinf));
          localStorage.setItem('Titulo_isquierdo', JSON.stringify(pageinf));

          (<HTMLHeadingElement>document.getElementById("tit")).innerHTML = response.data.performancelineal.tablero.nombreTablero;

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

      
      this.userData_aux= null;

      this.userData_aux= this.serviceAuth.Obtener_ls_authuser();
      console.log('list cifra notables cambio idioma'+ JSON.stringify(this.userData_aux));
  
      let menuCT: any = localStorage.getItem('menuCT');
      menuCT = JSON.parse(menuCT);
      console.log(menuCT);


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

        this.langDefault = this.serviceAuth.userData?.language;

        this.translate.setDefaultLang(this.langDefault);
        this.translate.use(this.langDefault);


        this.selectedCoin = filtro.monedaActual;
        this.selectedyear = String(filtro.anioActual);
        this.selectedMonth = filtro.mesActual;

        this.queryPerformanceGL = this.apollo.watchQuery(
          {
            query: QIPGL,
            variables: {
      

              idusuario: this.userData_aux?.idUsuario,
              companiaid:this.userData_aux?.companiaId,
              categoriacompaniaid:menuCT.categoriacompaniaid,
              tableroid:menuCT.idtablero,
              anio: filtro.anioActual,
              mes: filtro.mesActual,
              monedadestino:  filtro.monedaActual



            }
          }
        ).valueChanges.subscribe((response: any) => {
          if (response.data.performancelineal.listames && response.data.performancelineal.listaanual) {


            localStorage.removeItem('Titulo_isquierdo');
            const pageinf: pageinf = {
              title:response.data.performancelineal.tablero.nombreTablero
            }
            //alert(JSON.stringify(pageinf));
            localStorage.setItem('Titulo_isquierdo', JSON.stringify(pageinf));
  
            (<HTMLHeadingElement>document.getElementById("tit")).innerHTML = response.data.performancelineal.tablero.nombreTablero;
  



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

  //  this.coins.length=0;
this.months = [];

    let arraymonedas: any;

    for (let listac of this.userservice.responseLogin.companiaa){

      if(listac.idCompania==this.userData_aux?.companiaId){
  
        arraymonedas = listac.monedass.info_moneda;
        this.placeholderCoin = listac.monedass.descripcion_moneda.nombre;
    
      //  this.selectedCoinTable = arraymonedas.find((e: any) => e.idMonedaOdoo ==this.userservice.responseLogin.companiaa[0].idMonedaEmpresaOdoo).name;
  
        let arrayMeses: any = this.userservice.responseLogin.mess.info_mes;
        this.placeholderYear = this.userservice.responseLogin.anioo.descripcion_anio.nombre;
        this.placeholderMonth = this.userservice.responseLogin.mess.descripcion_mes.nombre;
    //   alert(arraymonedas.length);
        arraymonedas.forEach((e: any) => {
          let coin = {
            value: e.idMonedaOdoo,
            viewValue: e.name
          };

      //    this.coins=[];
        //  alert(this.coins.length)

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
    //  this.barChartColors.push({ backgroundColor: 'rgb(31,78,120)' });

    this.barChartData[0] = {
      data: listabar,
      label: 'VS ' + (new Date().getFullYear() - 1),
      barThickness: 40,
      barPercentage: 0.5,
      backgroundColor: '#F08B3B',
      hoverBackgroundColor: '#F08B3B'

    };
  }
  private fillbarchartAc(listabar: any) {
    this.barChartDataAc = [];
    // this.barChartColors.push({ backgroundColor: 'rgb(31,78,120)' });

    this.barChartDataAc[0] = {
      data: listabar,
      label: 'VS ' + (new Date().getFullYear() - 1),
      barThickness: 40,
      barPercentage: 0.5,
      backgroundColor: '#F08B3B',
      hoverBackgroundColor: '#F08B3B'

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

    let menuCT: any = localStorage.getItem('menuCT');
    menuCT = JSON.parse(menuCT);
    console.log(menuCT);


    //getting data from Login
    if (this.userservice.responseLogin) {
      this.months = [];
      this.barChartLabels = [];

    this.coins =[];




      let arraymonedas: any;

      for (let listac of this.userservice.responseLogin.companiaa){
  
        if(listac.idCompania==this.userData_aux?.companiaId){
    
          arraymonedas = listac.monedass.info_moneda;
          this.placeholderCoin = listac.monedass.descripcion_moneda.nombre;
      
        //  this.selectedCoinTable = arraymonedas.find((e: any) => e.idMonedaOdoo ==this.userservice.responseLogin.companiaa[0].idMonedaEmpresaOdoo).name;
    
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
  


      this.queryPerformanceGL = this.apollo.watchQuery(
        {
          query: QIPGL,
          variables: {



            idusuario: this.userData_aux?.idUsuario,
            companiaid:this.userData_aux?.companiaId,
            categoriacompaniaid:menuCT.categoriacompaniaid,
            tableroid:menuCT.idtablero,
            anio: Number(this.selectedyear),
            mes: this.selectedMonth,
            monedadestino:  this.selectedCoin


          }
        }
      ).valueChanges.subscribe((response: any) => {
        if (response.data.performancelineal.listames && response.data.performancelineal.listaanual) {

          localStorage.removeItem('Titulo_isquierdo');
          const pageinf: pageinf = {
            title:response.data.performancelineal.tablero.nombreTablero
          }
 
          localStorage.setItem('Titulo_isquierdo', JSON.stringify(pageinf));

          (<HTMLHeadingElement>document.getElementById("tit")).innerHTML = response.data.performancelineal.tablero.nombreTablero;




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