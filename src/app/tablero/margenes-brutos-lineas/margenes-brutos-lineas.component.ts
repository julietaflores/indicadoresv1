import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Apollo, QueryRef } from 'apollo-angular';
import gql from 'graphql-tag';
import { UserService } from 'src/app/services/user.service';
import { Label } from 'ng2-charts';
import * as pluginDataLabels from 'chartjs-plugin-datalabels';
import { Subscription } from 'rxjs';
import { AuthServiceService } from 'src/app/services/auth-service.service';
import { GlobalConstants } from 'src/app/GLOBALS/GlobalConstants';
import { TranslateService } from '@ngx-translate/core';
import { DataIndicador } from 'src/app/models/dataIndicador.interface';
import { Router } from '@angular/router';
import { UserAuth } from 'src/app/models/userAuth.interface';
import { pageinf } from 'src/app/models/pageinfoo';
const QIMBLINEAL = gql`
query  margenbruto_lineal($idusuario:Int!,$companiaid:Int!,$categoriacompaniaid:Int!,$tableroid:Int!,$anio:Int!,$mes:String, $monedadestino:Int!) {
  margenbruto_lineal(idusuario:$idusuario,companiaid:$companiaid,categoriacompaniaid:$categoriacompaniaid,tableroid:$tableroid,anio:$anio,mes:$mes,monedadestino:$monedadestino){
    tablero{
      idTablero
      nombreTablero
      estadoTablero
      urlTablero
   
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
  selector: 'app-margenes-brutos-lineas',
  templateUrl: './margenes-brutos-lineas.component.html',
  styleUrls: ['./margenes-brutos-lineas.component.scss']
})
export class MargenesBrutosLineasComponent implements OnInit {

  coins: any[] = [];
  years: any[] = GlobalConstants.years;
  months: any[] = [];

  private queryMBLineal: Subscription;//get first list products
  private queryLogin: Subscription;

  listamesMB: MargenBrutoLineal[] = [];
  listyearVAR: MargenBrutoLineal[] = [];


  placeholderYear: String = 'Year';
  placeholderMonth: String = 'Month';
  placeholderCoin: String = 'Currency';
  public barChartOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      yAxes: [{

        ticks: {
          fontSize: 12,
          padding: 15,
          position: 'right'

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

        //  padding:{
        //   left: function (labor_anc: any){
        //     console.log(labor_anc);
        //   },
        //   right: 0,

        //  },

        padding: function (labor_anc: any) {

          //labor_anc = screen.width;
          console.log(labor_anc.chart.options);
          return labor_anc.chart.options.plugins.datalabels.padding.left = -15;

          // console.log(labor_anc.dataset.data);
          // console.log(labor_anc.chart);
          //return  10;
        },



        // padding: function (labor_anc: number ) {
        //   labor_anc = screen.width;
        //   console.log('cc ' + labor_anc);


        //   switch (true) {
        //     case (labor_anc >= 320) && (labor_anc <= 575):
        //       console.log('modo celular');
        //       return 10;
        //       break;
        //     case (labor_anc >= 576) && (labor_anc <= 767):
        //       console.log('modo celular version 1');
        //       return 10;
        //       break;
        //     case (labor_anc >= 768) && (labor_anc <= 1023):
        //       console.log('modo celular version 2');
        //       return 9;
        //       break;
        //     case (labor_anc >= 1024) && (labor_anc <= 1439):
        //       console.log('modo celular version 3');
        //       return 8;
        //       break;

        //     case (labor_anc >= 1440):
        //       console.log('modo celular version 4');
        //       return 0;
        //       break;

        //   }

        //   if (labor_anc >= 320 && labor_anc <= 516) {

        //     console.log('modo celular');
        //     return 10;
        //   } else {

        //     console.log('modo mayor');
        //     return 30;
        //   }


        // },

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

  public barChartLabels: string[] = [

  ];
  public barChartType = 'horizontalBar';
  public barChartLegend = true;

  public barChartData: any[] = [];
  public barChartDataAc: any[] = [];


  langDefault: any = '';
  selectedyear = String(new Date().getFullYear());
  selectedMonth = String(this.getCurrenlyMonth());
  MesActual: any = this.getCurrenlyMonth();
  selectedCoin = 0;
  selectedCoinTable: String = '';//Variable en table

  amoutIncremented: any;
  amoutIncrementedAc: any;

  amoutIncrementedcanvas: any;
  amoutIncrementedcanvasAc: any;
  userData_aux: UserAuth | null = null;


  constructor(public userservice: UserService,
    private apollo: Apollo, private serviceAuth: AuthServiceService, private route: Router,
    public translateService: TranslateService) {

    this.route.routeReuseStrategy.shouldReuseRoute = () => false;


    this.queryLogin = new Subscription();
    this.queryMBLineal = new Subscription();
  }

  ngOnInit(): void {
    if (this.userservice.responseLogin) {


      (<HTMLHeadingElement>document.getElementById("tit")).innerHTML = '';

      this.userData_aux = this.serviceAuth.Obtener_ls_authuser();
      console.log('list cifra notables inicio' + JSON.stringify(this.userData_aux));
      console.log('variable inicio' + JSON.stringify(this.userData_aux?.ls_idMonedaOdoo));

      this.langDefault = this.userData_aux?.language;
      this.translateService.setDefaultLang(this.langDefault);
      this.translateService.use(this.langDefault);

      //this.selectedCoin = this.userservice.responseLogin.companiaa[0].idMonedaEmpresaOdoo;
      this.initialSetup();

      this.selectedCoin = this.userData_aux?.ls_idMonedaOdoo;


      //  this.selectedCoin = this.userservice.responseLogin.companiaa[0].idMonedaEmpresaOdoo;
      //  this.setup();
      const currentFiltros: DataIndicador = {
        anioActual: Number(this.selectedyear),
        mesActual: this.selectedMonth,
        monedaActual: this.selectedCoin

      }

      let menuCT: any = localStorage.getItem('menuCT');
      menuCT = JSON.parse(menuCT);
      console.log(menuCT);


      localStorage.setItem('filtroAMM', JSON.stringify(currentFiltros));

      this.queryMBLineal = this.apollo.watchQuery({
        query: QIMBLINEAL,
        variables: {

          idusuario: this.userData_aux?.idUsuario,
          companiaid: this.userData_aux?.companiaId,
          categoriacompaniaid: menuCT.categoriacompaniaid,
          tableroid: menuCT.idtablero,
          anio: new Date().getFullYear(),
          mes: this.getCurrenlyMonth(),
          monedadestino: this.selectedCoin



        },
        fetchPolicy: "no-cache"
      }).valueChanges.subscribe((response: any) => {

        if (response.data.margenbruto_lineal.lista_mes && response.data.margenbruto_lineal.lista_anual) {



          localStorage.removeItem('Titulo_isquierdo');
          const pageinf: pageinf = {
            title: response.data.margenbruto_lineal.tablero.nombreTablero
          }
          //alert(JSON.stringify(pageinf));
          localStorage.setItem('Titulo_isquierdo', JSON.stringify(pageinf));

          (<HTMLHeadingElement>document.getElementById("tit")).innerHTML = response.data.margenbruto_lineal.tablero.nombreTablero;

          let listabar: any[] = [];
          let listabarAc: any[] = [];
          this.barChartData = [];
          this.barChartDataAc = [];
          this.barChartLabels = [];
          this.listamesMB = [];
          this.listyearVAR = [];

          let listames = response.data.margenbruto_lineal.lista_mes;
          let listaanual = response.data.margenbruto_lineal.lista_anual;
          this.dataSourceMes = new MatTableDataSource<MargenBrutoLineal>();
          this.dataSourceAcumulado = new MatTableDataSource<MargenBrutoLineal>();

          this.getSizeCanvas(listames, listaanual);

          listames.forEach((value: any) => {
            let item = {
              division: value.nombre,
              porcentaje_margen: value.porcentaje_margen_actual,
              bps: value.bPS,
              moneda: value.importe_actual
            }
            let calculograficomes = Number(value.calculo_grafico.replace(',', '.'));

            this.listamesMB.push(item);

            listabar.push(Number(calculograficomes.toFixed(2)));
            this.barChartLabels.push(value.nombre);
          });
          listaanual.forEach((value: any) => {
            let itemac = {
              division: value.nombre,
              porcentaje_margen: value.porcentaje_margen_actual,
              bps: value.bPS,
              moneda: value.importe_actual
            }
            if (listames.length === 0) {
              this.barChartLabels.push(value.nombre);
            }
            let calculografico = Number(value.calculo_grafico.replace(',', '.'));



            this.listyearVAR.push(itemac);
            listabarAc.push(calculografico.toFixed(2));

            // listabarAc.push(value.porcentaje_margen_actual);
          });

          this.dataSourceMes = new MatTableDataSource<MargenBrutoLineal>(this.listamesMB);




          this.barChartData[0] = {
            data: listabar,
            label: 'VAR. vs.' + (new Date().getFullYear() - 1),
            barThickness: 40,
            barPercentage: 0.5,
            backgroundColor: '#F08B3B',
            hoverBackgroundColor: '#F08B3B',
          }

          this.barChartDataAc[0] = {
            data: listabarAc,
            label: 'VAR. vs.' + (new Date().getFullYear() - 1),
            barThickness: 40,
            barPercentage: 0.5,
            backgroundColor: '#F08B3B',
            hoverBackgroundColor: '#F08B3B',
          }
          this.dataSourceAcumulado = new MatTableDataSource<MargenBrutoLineal>(this.listyearVAR);




        }

      });
    }
    else {

      this.userData_aux = null;

      this.userData_aux = this.serviceAuth.Obtener_ls_authuser();
      console.log('list cifra notables cambio idioma' + JSON.stringify(this.userData_aux));

      let menuCT: any = localStorage.getItem('menuCT');
      menuCT = JSON.parse(menuCT);
      console.log(menuCT);


      this.queryLogin = this.apollo.watchQuery({
        query: LOGIN,
        variables: { usuario: this.serviceAuth.userData?.name, clave: this.serviceAuth.userData?.password },
      }).valueChanges.subscribe((response: any) => {
        //this.setup();

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

        this.translateService.setDefaultLang(this.langDefault);
        this.translateService.use(this.langDefault);


        this.selectedCoin = filtro.monedaActual;
        this.selectedyear = String(filtro.anioActual);
        this.selectedMonth = filtro.mesActual;


        this.queryMBLineal = this.apollo.watchQuery({
          query: QIMBLINEAL,
          variables: {

            idusuario: this.userData_aux?.idUsuario,
            companiaid: this.userData_aux?.companiaId,
            categoriacompaniaid: menuCT.categoriacompaniaid,
            tableroid: menuCT.idtablero,
            anio: filtro.anioActual,
            mes: filtro.mesActual,
            monedadestino: filtro.monedaActual


          },
          fetchPolicy: "no-cache"
        }).valueChanges.subscribe((response: any) => {

          if (response.data.margenbruto_lineal.lista_mes && response.data.margenbruto_lineal.lista_anual) {


            localStorage.removeItem('Titulo_isquierdo');
            const pageinf: pageinf = {
              title: response.data.margenbruto_lineal.tablero.nombreTablero
            }
            //alert(JSON.stringify(pageinf));
            localStorage.setItem('Titulo_isquierdo', JSON.stringify(pageinf));

            (<HTMLHeadingElement>document.getElementById("tit")).innerHTML = response.data.margenbruto_lineal.tablero.nombreTablero;


            let listabar: any = [];
            let listabarAc: any = [];
            this.barChartData = [];
            this.barChartDataAc = [];
            this.barChartLabels = [];
            this.listamesMB = [];
            this.listyearVAR = [];

            let listames = response.data.margenbruto_lineal.lista_mes;
            let listaanual = response.data.margenbruto_lineal.lista_anual;
            this.dataSourceMes = new MatTableDataSource<MargenBrutoLineal>();
            this.dataSourceAcumulado = new MatTableDataSource<MargenBrutoLineal>();
            this.getSizeCanvas(listames, listaanual);

            listames.forEach((value: any) => {
              let item = {
                division: value.nombre,
                porcentaje_margen: value.porcentaje_margen_actual,
                bps: value.bPS,
                moneda: value.importe_actual
              }
              let calculograficomes = Number(value.calculo_grafico.replace(',', '.'));

              this.listamesMB.push(item);

              listabar.push(Number(calculograficomes.toFixed(2)));
              this.barChartLabels.push(value.nombre);
            });
            listaanual.forEach((value: any) => {
              let itemac = {
                division: value.nombre,
                porcentaje_margen: value.porcentaje_margen_actual,
                bps: value.bPS,
                moneda: value.importe_actual
              }
              if (listames.length === 0) {
                this.barChartLabels.push(value.nombre);
              }
              let calculografico = Number(value.calculo_grafico.replace(',', '.'));



              this.listyearVAR.push(itemac);
              listabarAc.push(calculografico.toFixed(2));

              // listabarAc.push(value.porcentaje_margen_actual);
            });



            this.dataSourceMes = new MatTableDataSource<MargenBrutoLineal>(this.listamesMB);


            this.barChartData[0] = {
              data: listabar,
              label: 'VAR. vs.' + (new Date().getFullYear() - 1),
              barPercentage: 1,
              backgroundColor: '#F08B3B',
              hoverBackgroundColor: '#F08B3B',
            }


            this.barChartDataAc[0] = {
              data: listabarAc,
              label: 'VAR. vs.' + (new Date().getFullYear() - 1),
              barPercentage: 1,
              backgroundColor: '#F08B3B',
              hoverBackgroundColor: '#F08B3B',
            }
            this.dataSourceAcumulado = new MatTableDataSource<MargenBrutoLineal>(this.listyearVAR);

          }

        });

      });
    }


  }

  displayedColumns = ['division', 'porcentaje_margen', 'bps', 'importe_actual'];
  dataSourceMes = new MatTableDataSource<MargenBrutoLineal>();
  dataSourceAcumulado = new MatTableDataSource<MargenBrutoLineal>();
  public chartHovered(e: any): void {
    // console.log(e);
  }
  // events
  public chartClicked(e: any): void {
    // console.log(e);
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


  private initialSetup() {

    //  this.coins.length=0;
    this.months = [];

    let arraymonedas: any;

    for (let listac of this.userservice.responseLogin.companiaa) {

      if (listac.idCompania == this.userData_aux?.companiaId) {

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
  
  setup() {
    this.coins = [];
    let arraymonedas = this.userservice.responseLogin.monedass.info_moneda;
    let arrayMeses: any = this.userservice.responseLogin.mess.info_mes;
    this.selectedCoinTable = arraymonedas.find((e: any) => e.idMonedaEmpresaOdoo ==
      this.userservice.responseLogin.companiaa[0].idMonedaEmpresaOdoo).name;

    this.langDefault = this.userservice.responseLogin.idioma.abreviaturaIdioma;


    this.translateService.setDefaultLang(this.langDefault);
    this.translateService.use(this.langDefault);
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
  getSizeCanvas(listames: any, listaanual: any) {
    this.amoutIncremented = 150 + (50 * listames.length) + "px";
    this.amoutIncrementedAc = 150 + (50 * listaanual.length) + "px";

    this.amoutIncrementedcanvas = 100 + (50 * listames.length) + "px";
    this.amoutIncrementedcanvasAc = 100 + (50 * listaanual.length) + "px";
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
  saveFiltros() {
    const currentFiltros: DataIndicador = {
      anioActual: Number(this.selectedyear),
      mesActual: this.selectedMonth,
      monedaActual: this.selectedCoin

    }

    localStorage.removeItem('filtroAMM');
    localStorage.setItem('filtroAMM', JSON.stringify(currentFiltros));


  }
  refreshQuery() {
    alert('amig');
    this.saveFiltros();
    this.listamesMB = [];
    this.listyearVAR = [];


    let menuCT: any = localStorage.getItem('menuCT');
    menuCT = JSON.parse(menuCT);
    console.log(menuCT);

    if (this.userservice.responseLogin) {


      this.coins = [];




      let arraymonedas: any;

      for (let listac of this.userservice.responseLogin.companiaa) {

        if (listac.idCompania == this.userData_aux?.companiaId) {

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

      // this.coins = [];
      // let arraymonedas = this.userservice.responseLogin.monedass.info_moneda;
      // let arrayMeses: any = this.userservice.responseLogin.mess.info_mes;
      // this.selectedCoinTable = arraymonedas.find((e: any) => e.idMonedaEmpresaOdoo ==
      //   this.selectedCoin).name
      // arraymonedas.forEach((e: any) => {
      //   let coin = {
      //     value: e.idMonedaEmpresaOdoo,
      //     viewValue: e.name
      //   };
      //   this.coins.push(coin);
      // });
      // arrayMeses.forEach((item: any) => {
      //   const mes = {
      //     value: String(item.mesid),
      //     viewValue: item.nombre
      //   }
      //   this.months.push(mes);
      // });





      this.queryMBLineal = this.apollo.watchQuery({
        query: QIMBLINEAL,
        variables: {

          idusuario: this.userData_aux?.idUsuario,
          companiaid: this.userData_aux?.companiaId,
          categoriacompaniaid: menuCT.categoriacompaniaid,
          tableroid: menuCT.idtablero,
          anio: Number(this.selectedyear),
          mes: this.selectedMonth,
          monedadestino: this.selectedCoin

        },
        fetchPolicy: "no-cache"
      }).valueChanges.subscribe((result: any) => {

        if (result.data.margenbruto_lineal.lista_mes && result.data.margenbruto_lineal.lista_anual) {
  alert('hh');

          localStorage.removeItem('Titulo_isquierdo');
          const pageinf: pageinf = {
            title: result.data.margenbruto_lineal.tablero.nombreTablero
          }

          localStorage.setItem('Titulo_isquierdo', JSON.stringify(pageinf));

          (<HTMLHeadingElement>document.getElementById("tit")).innerHTML = result.data.margenbruto_lineal.tablero.nombreTablero;



          let listabar: any = [];
          let listabarAc: any[] = [];
          this.barChartLabels = [];
          this.barChartData = [];

          let listames = result.data.margenbruto_lineal.lista_mes;
          let listaanual = result.data.margenbruto_lineal.lista_anual;
          this.dataSourceMes = new MatTableDataSource<MargenBrutoLineal>();
          this.dataSourceAcumulado = new MatTableDataSource<MargenBrutoLineal>();

          this.getSizeCanvas(listames, listaanual);


          listames.forEach((value: any) => {
            let item = {
              division: value.nombre,
              porcentaje_margen: value.porcentaje_margen_actual,
              bps: value.bPS,
              moneda: value.importe_actual
            }
            let calculograficomes = Number(value.calculo_grafico.replace(',', '.'));

            this.listamesMB.push(item);

            listabar.push(Number(calculograficomes.toFixed(2)));
            this.barChartLabels.push(value.nombre);
          });
          listaanual.forEach((value: any) => {
            let itemac = {
              division: value.nombre,
              porcentaje_margen: value.porcentaje_margen_actual,
              bps: value.bPS,
              moneda: value.importe_actual
            }
            if (listames.length === 0) {
              this.barChartLabels.push(value.nombre);
            }
            let calculografico = Number(value.calculo_grafico.replace(',', '.'));



            this.listyearVAR.push(itemac);
            listabarAc.push(calculografico.toFixed(2));

            // listabarAc.push(value.porcentaje_margen_actual);
          });



          this.barChartData[0] = {
            data: listabar,
            label: 'VAR. vs.' + (new Date().getFullYear() - 1),
            barThickness: 40,
            barPercentage: 0.5,
            backgroundColor: '#F08B3B',
            hoverBackgroundColor: '#F08B3B'
          }
          this.barChartDataAc[0] = {
            data: listabarAc,
            label: 'VAR. vs.' + (new Date().getFullYear() - 1),
            barThickness: 40,
            barPercentage: 0.5,
            backgroundColor: '#F08B3B',
            hoverBackgroundColor: '#F08B3B'

          }
          this.dataSourceMes = new MatTableDataSource<MargenBrutoLineal>(this.listamesMB);

          this.dataSourceAcumulado = new MatTableDataSource<MargenBrutoLineal>(this.listyearVAR);




        }

      });
    }

  }
}


export interface MargenBrutoLineal {
  division: string;
  porcentaje_margen: string;
  bps: string;
  moneda: number;
}
