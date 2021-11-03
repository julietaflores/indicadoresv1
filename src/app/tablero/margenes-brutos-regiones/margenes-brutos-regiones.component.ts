import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
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
import { GraphqlServiceService } from 'src/app/services/graphql-service.service';

@Component({
  selector: 'app-margenes-brutos-regiones',
  templateUrl: './margenes-brutos-regiones.component.html',
  styleUrls: ['./margenes-brutos-regiones.component.scss']
})
export class MargenesBrutosRegionesComponent implements OnInit, OnDestroy {


  coins: any[] = [];
  years: any[] = GlobalConstants.years;
  months: any[] = [];

  placeholderYear: String = 'Year';
  placeholderMonth: String = 'Month';
  placeholderCoin: String = 'Currency';
  // This is line chart
  // bar chart
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

  public barChartLabels: string[] = [

  ];
  public barChartType = 'horizontalBar';
  public barChartLegend = true;

  public barChartData: any[] = [];
  public barChartDataAc: any[] = [];



  displayedColumns = ['division', 'porcentaje_margen', 'bps', 'importe_actual'];

  listamesMB: MargenBrutoRegion[] = [];
  listyearVAR: MargenBrutoRegion[] = [];

  dataSourceMes = new MatTableDataSource<MargenBrutoRegion>();
  dataSourceAcumulado = new MatTableDataSource<MargenBrutoRegion>();

  private queryLogin: Subscription;
  queryMesRegion: Subscription;//get first list products

  selectedyear = String(new Date().getFullYear());
  selectedMonth = String(this.getCurrenlyMonth());
  MesActual: any = this.getCurrenlyMonth();
  selectedCoin = 0;
  selectedCoinTable: String = '';//Variable en table


  langDefault: any = '';
  amoutIncremented: any;
  amoutIncrementedAc: any;

  amoutIncrementedcanvas: any;
  amoutIncrementedcanvasAc: any;

  userData_aux: UserAuth | null = null;


  constructor(public userservice: UserService,
    private serviceAuth: AuthServiceService, private route: Router,
    public translateService: TranslateService, private serviceGraphql: GraphqlServiceService) {
    this.route.routeReuseStrategy.shouldReuseRoute = () => false;

    this.queryMesRegion = new Subscription();
    this.queryLogin = new Subscription();
  }

  ngOnInit(): void {
    if (this.userservice.responseLogin) {
      (<HTMLHeadingElement>document.getElementById("tit")).innerHTML = '';

      this.userData_aux = this.serviceAuth.Obtener_ls_authuser();
      this.langDefault = this.userData_aux?.language;
      this.translateService.setDefaultLang(this.langDefault);
      this.translateService.use(this.langDefault);

      //this.selectedCoin = this.userservice.responseLogin.companiaa[0].idMonedaEmpresaOdoo;
      this.initialSetup();

      this.selectedCoin = this.userData_aux?.ls_idMonedaOdoo;


      //  this.selectedCoin = this.userservice.responseLogin.companiaa[0].idMonedaEmpresaOdoo;
      //  this.setup();



      // this.selectedCoin = this.userservice.responseLogin.companiaa[0].idMonedaEmpresaOdoo;
      // let arrayMeses: any = this.userservice.responseLogin.mess.info_mes;
      // let arraymonedas = this.userservice.responseLogin.monedass.info_moneda;
      // this.selectedCoinTable = arraymonedas.find((e: any) => e.idMonedaEmpresaOdoo ==
      //   this.userservice.responseLogin.companiaa[0].idMonedaEmpresaOdoo).name;
      // this.placeholderYear = this.userservice.responseLogin.anioo.descripcion_anio.nombre;
      // this.placeholderMonth = this.userservice.responseLogin.mess.descripcion_mes.nombre;
      // this.placeholderCoin = this.userservice.responseLogin.monedass.descripcion_moneda.nombre;

      // this.langDefault = this.userservice.responseLogin.idioma.abreviaturaIdioma;

      // // alert("es dioma actual "+ this.langDefault);
      // this.translateService.setDefaultLang(this.langDefault);
      // this.translateService.use(this.langDefault);
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
      const currentFiltros: DataIndicador = {
        anioActual: Number(this.selectedyear),
        mesActual: this.selectedMonth,
        monedaActual: this.selectedCoin

      }


      let menuCT: any = localStorage.getItem('menuCT');
      menuCT = JSON.parse(menuCT);
      console.log(menuCT);

      localStorage.setItem('filtroAMM', JSON.stringify(currentFiltros));

      this.queryMesRegion = this.serviceGraphql.getMargenBrutoRegiones(this.userData_aux?.idUsuario,
        this.userData_aux?.companiaId, menuCT.categoriacompaniaid, menuCT.idtablero, new Date().getFullYear(),
        this.getCurrenlyMonth(), this.selectedCoin).valueChanges.subscribe((resultado: any) => {
          if (resultado.data.margenbruto_region.lista_mes && resultado.data.margenbruto_region.lista_anual) {
            localStorage.removeItem('titulo_izquierdo');
            const pageinf: pageinf = {
              title: resultado.data.margenbruto_region.tablero.nombreTablero
            }
            //alert(JSON.stringify(pageinf));
            localStorage.setItem('titulo_izquierdo', JSON.stringify(pageinf));

            (<HTMLHeadingElement>document.getElementById("tit")).innerHTML = resultado.data.margenbruto_region.tablero.nombreTablero;

            console.log(resultado);
            let listabar: any[] = [];
            let listabaryear: any[] = [];
            this.barChartData = [];
            this.barChartDataAc = [];
            this.barChartLabels = [];
            this.listamesMB = [];
            this.listyearVAR = [];
            this.dataSourceMes = new MatTableDataSource<MargenBrutoRegion>();
            this.dataSourceAcumulado = new MatTableDataSource<MargenBrutoRegion>();

            let listames = resultado.data.margenbruto_region.lista_mes;
            let listaanual = resultado.data.margenbruto_region.lista_anual;

            this.amoutIncremented = 150 + (50 * listames.length) + "px";
            this.amoutIncrementedAc = 150 + (50 * listaanual.length) + "px";

            this.amoutIncrementedcanvas = 100 + (50 * listames.length) + "px";
            this.amoutIncrementedcanvasAc = 100 + (50 * listaanual.length) + "px";

            listames.forEach((value: any) => {
              let itemmes = {
                division: value.nombre,
                porcentaje_margen: value.porcentaje_margen_actual,
                bps: value.bPS,
                moneda: value.importe_actual
              }
              let calculograficomes = Number(value.calculo_grafico.replace(',', '.'));
              listabar.push(Number(calculograficomes.toFixed(2)));

              this.listamesMB.push(itemmes);
              this.barChartLabels.push(value.nombre);

            });
            listaanual.forEach((value: any) => {
              let itemyear = {
                division: value.nombre,
                porcentaje_margen: value.porcentaje_margen_actual,
                bps: value.bPS,
                moneda: value.importe_actual
              }
              let calculografico = Number(value.calculo_grafico.replace(',', '.'));

              listabaryear.push(calculografico.toFixed(2));

              this.listyearVAR.push(itemyear);
              if (listames.length === 0) {
                this.barChartLabels.push(value.nombre);
              }

            });
            this.dataSourceAcumulado = new MatTableDataSource<MargenBrutoRegion>(this.listyearVAR);


            this.barChartData[0] = {
              data: listabar,
              label: 'VAR. vs.' + (new Date().getFullYear() - 1),
              barThickness: 40,
              barPercentage: 0.5,
              backgroundColor: '#F08B3B',
              hoverBackgroundColor: '#F08B3B',
            }
            this.barChartDataAc[0] = {
              data: listabaryear,
              label: 'VAR. vs.' + (new Date().getFullYear() - 1),
              barThickness: 40,
              barPercentage: 0.5,
              backgroundColor: '#F08B3B',
              hoverBackgroundColor: '#F08B3B'
            }

            this.dataSourceMes = new MatTableDataSource<MargenBrutoRegion>(this.listamesMB);

          }


        });

    }
    else {


      this.userData_aux = null;

      this.userData_aux = this.serviceAuth.Obtener_ls_authuser();

      let menuCT: any = localStorage.getItem('menuCT');
      menuCT = JSON.parse(menuCT);

      this.queryLogin = this.serviceGraphql.postLogin(this.serviceAuth.userData?.name,
        this.serviceAuth.userData?.password).valueChanges.
        subscribe((response: any) => {
          // let filtro:DataIndicador| null | any = null;
          // filtro = localStorage.getItem('filtroAMM');
          // if (filtro) {
          //   filtro = JSON.parse(filtro);
          // } else {
          //   filtro = null;
          // }
          // this.selectedCoin = filtro.monedaActual ;
          // this.selectedyear=String(filtro.anioActual);
          // this.selectedMonth=filtro.mesActual;
          // this.userservice.responseLogin = response.data.validarlogin;
          // let arraymonedas = this.userservice.responseLogin.monedass.info_moneda;
          // let arrayMeses: any = this.userservice.responseLogin.mess.info_mes;
          // this.selectedCoinTable = arraymonedas.find((e: any) => e.idMonedaEmpresaOdoo ==
          // this.userservice.responseLogin.companiaa[0].idMonedaEmpresaOdoo).name;
          // this.langDefault = this.userservice.responseLogin.idioma.abreviaturaIdioma;

          // this.placeholderYear = this.userservice.responseLogin.anioo.descripcion_anio.nombre;
          // this.placeholderMonth = this.userservice.responseLogin.mess.descripcion_mes.nombre;
          // this.placeholderCoin = this.userservice.responseLogin.monedass.descripcion_moneda.nombre;


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


          // this.selectedCoin = filtro.monedaActual;
          //   this.selectedyear = String(filtro.anioActual);
          //  this.selectedMonth = filtro.mesActual;




          // // alert("es dioma actual "+ this.langDefault);
          // this.translateService.setDefaultLang(this.langDefault);
          // this.translateService.use(this.langDefault);

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

          this.queryMesRegion = this.serviceGraphql.getMargenBrutoRegiones(this.userData_aux?.idUsuario,
            this.userData_aux?.companiaId, menuCT.categoriacompaniaid, menuCT.idtablero,
            filtro.anioActual, filtro.mesActual, filtro.monedaActual).valueChanges.
            subscribe((result: any) => {
              if (result.data.margenbruto_region.lista_mes && result.data.margenbruto_region.lista_anual) {

                localStorage.removeItem('titulo_izquierdo');
                const pageinf: pageinf = {
                  title: result.data.margenbruto_region.tablero.nombreTablero
                }
                //alert(JSON.stringify(pageinf));
                localStorage.setItem('titulo_izquierdo', JSON.stringify(pageinf));

                (<HTMLHeadingElement>document.getElementById("tit")).innerHTML = result.data.margenbruto_region.tablero.nombreTablero;


                let listabar: any = [];
                let listabaryear: any[] = [];
                this.barChartData = [];
                this.barChartLabels = [];
                this.listamesMB = [];
                this.listyearVAR = [];
                this.dataSourceMes = new MatTableDataSource<MargenBrutoRegion>();
                this.dataSourceAcumulado = new MatTableDataSource<MargenBrutoRegion>();
                let listames = result.data.margenbruto_region.lista_mes;
                let listaanual = result.data.margenbruto_region.lista_anual;

                this.amoutIncremented = 150 + (50 * listames.length) + "px";
                this.amoutIncrementedAc = 150 + (50 * listaanual.length) + "px";

                this.amoutIncrementedcanvas = 100 + (50 * listames.length) + "px";
                this.amoutIncrementedcanvasAc = 100 + (50 * listaanual.length) + "px";

                listames.forEach((value: any) => {
                  let itemmes = {
                    division: value.nombre,
                    porcentaje_margen: value.porcentaje_margen_actual,
                    bps: value.bPS,
                    moneda: value.importe_actual
                  }
                  let calculograficomes = Number(value.calculo_grafico.replace(',', '.'));
                  listabar.push(Number(calculograficomes.toFixed(2)));

                  this.listamesMB.push(itemmes);
                  this.barChartLabels.push(value.nombre);

                });
                listaanual.forEach((value: any) => {
                  let itemyear = {
                    division: value.nombre,
                    porcentaje_margen: value.porcentaje_margen_actual,
                    bps: value.bPS,
                    moneda: value.importe_actual
                  }
                  let calculografico = Number(value.calculo_grafico.replace(',', '.'));

                  listabaryear.push(calculografico.toFixed(2));

                  this.listyearVAR.push(itemyear);
                  if (listames.length === 0) {
                    this.barChartLabels.push(value.nombre);
                  }

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
                  data: listabaryear,
                  label: 'VAR. vs.' + (new Date().getFullYear() - 1),
                  barThickness: 40,
                  barPercentage: 0.5,
                  backgroundColor: '#F08B3B',
                  hoverBackgroundColor: '#F08B3B'
                }

                this.dataSourceMes = new MatTableDataSource<MargenBrutoRegion>(this.listamesMB);
                this.dataSourceAcumulado = new MatTableDataSource<MargenBrutoRegion>(this.listyearVAR);

              }


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
    //  alert('cc');
    this.refreshQuery();
  }
  ngOnDestroy() {
    this.queryMesRegion.unsubscribe()
  }
  getAbsoluto(value: number) {
    return Math.abs(value);
  }


  private initialSetup() {

    // let arraymonedas = this.userservice.responseLogin.monedass.info_moneda;
    // let arrayMeses: any = this.userservice.responseLogin.mess.info_mes;
    // this.selectedCoinTable = arraymonedas.find((e: any) => e.idMonedaEmpresaOdoo ==
    // this.userservice.responseLogin.companiaa[0].idMonedaEmpresaOdoo).name;
    // this.langDefault = this.userservice.responseLogin.idioma.abreviaturaIdioma;

    // this.placeholderYear = this.userservice.responseLogin.anioo.descripcion_anio.nombre;
    // this.placeholderMonth = this.userservice.responseLogin.mess.descripcion_mes.nombre;
    // this.placeholderCoin = this.userservice.responseLogin.monedass.descripcion_moneda.nombre;

    //  this.coins.length=0;
    this.months = [];

    let arraymonedas: any;

    for (let listac of this.userservice.responseLogin.companiaa) {

      if (listac.idCompania == this.userData_aux?.companiaId) {

        arraymonedas = listac.monedass.info_moneda;
        this.placeholderCoin = listac.monedass.descripcion_moneda.nombre;
        this.selectedCoinTable = arraymonedas.find((e: any) => e.idMonedaOdoo ==
          this.selectedCoin).name;

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


  private refreshQuery() {
    this.listamesMB = [];
    this.listyearVAR = [];
    const currentFiltros: DataIndicador = {
      anioActual: Number(this.selectedyear),
      mesActual: this.selectedMonth,
      monedaActual: this.selectedCoin

    }
    localStorage.removeItem('filtroAMM');
    localStorage.setItem('filtroAMM', JSON.stringify(currentFiltros));


    let menuCT: any = localStorage.getItem('menuCT');
    menuCT = JSON.parse(menuCT);

    if (this.userservice.responseLogin) {
      // this.coins = [];
      // this.barChartLabels = [];

      //  let arraymonedas = this.userservice.responseLogin.monedass.info_moneda;
      //  this.selectedCoinTable = arraymonedas.find((e: any) => e.idMonedaEmpresaOdoo ==
      //  this.selectedCoin).name
      // arraymonedas.forEach((e: any) => {
      //   let coin = {
      //     value: e.idMonedaEmpresaOdoo,
      //     viewValue: e.name
      //   };
      //   this.coins.push(coin);
      // });


      this.coins = [];
      let arraymonedas: any;

      for (let listac of this.userservice.responseLogin.companiaa) {

        if (listac.idCompania == this.userData_aux?.companiaId) {

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

      this.queryMesRegion = this.serviceGraphql.getMargenBrutoRegiones(this.userData_aux?.idUsuario,
        this.userData_aux?.companiaId, menuCT.categoriacompaniaid, menuCT.idtablero, Number(this.selectedyear),
        this.selectedMonth, this.selectedCoin).valueChanges.subscribe((result: any) => {
          if (result.data.margenbruto_region.lista_mes && result.data.margenbruto_region.lista_anual) {

            localStorage.removeItem('titulo_izquierdo');
            const pageinf: pageinf = {
              title: result.data.margenbruto_region.tablero.nombreTablero
            }

            localStorage.setItem('titulo_izquierdo', JSON.stringify(pageinf));

            (<HTMLHeadingElement>document.getElementById("tit")).innerHTML = result.data.margenbruto_region.tablero.nombreTablero;


            let listabar: any = [];
            let listabaryear: any[] = [];
            this.barChartData = [];
            this.barChartLabels = [];

            this.dataSourceMes = new MatTableDataSource<MargenBrutoRegion>();
            this.dataSourceAcumulado = new MatTableDataSource<MargenBrutoRegion>();
            let listames = result.data.margenbruto_region.lista_mes;
            let listaanual = result.data.margenbruto_region.lista_anual;

            this.amoutIncremented = 150 + (50 * listames.length) + "px";
            this.amoutIncrementedAc = 150 + (50 * listaanual.length) + "px";

            this.amoutIncrementedcanvas = 100 + (50 * listames.length) + "px";
            this.amoutIncrementedcanvasAc = 100 + (50 * listaanual.length) + "px";



            listames.forEach((value: any) => {
              let item = {
                division: value.nombre,
                porcentaje_margen: value.porcentaje_margen_actual,
                bps: value.bPS,
                moneda: value.importe_actual
              }
              let calculograficomes = Number(value.calculo_grafico.replace(',', '.'));
              listabar.push(Number(calculograficomes.toFixed(2)));

              this.listamesMB.push(item);
              this.barChartLabels.push(value.nombre);

            });
            listaanual.forEach((valueanual: any) => {
              let item = {
                division: valueanual.nombre,
                porcentaje_margen: valueanual.porcentaje_margen_actual,
                bps: valueanual.bPS,
                moneda: valueanual.importe_actual
              }
              let calculografico = Number(valueanual.calculo_grafico.replace(',', '.'));

              listabaryear.push(calculografico.toFixed(2));

              this.listyearVAR.push(item);
              if (listames.length === 0) {
                this.barChartLabels.push(valueanual.nombre);
              }


            });

            this.dataSourceAcumulado = new MatTableDataSource<MargenBrutoRegion>(this.listyearVAR);



            this.barChartData[0] = {
              data: listabar,
              label: 'VAR. vs.' + (new Date().getFullYear() - 1),
              barThickness: 40,
              barPercentage: 0.5,
              backgroundColor: '#F08B3B',
              hoverBackgroundColor: '#F08B3B',
            }

            this.barChartDataAc[0] = {
              data: listabaryear,
              label: 'VAR. vs.' + (new Date().getFullYear() - 1),
              barThickness: 40,
              barPercentage: 0.5,
              backgroundColor: '#F08B3B',
              hoverBackgroundColor: '#F08B3B',
            }

            this.dataSourceMes = new MatTableDataSource<MargenBrutoRegion>(this.listamesMB);

          }


        });
    }
  }

}

export interface MargenBrutoRegion {
  division: string;
  porcentaje_margen: string;
  bps: string;
  moneda: number;
}


