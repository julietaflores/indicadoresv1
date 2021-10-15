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
const QIMBLINEAL = gql`
query  margenbruto_lineal($idusuario:Int!,$anio:Int!,$mes:String,$compania:Int!, $monedadestino:Int!) {
  margenbruto_lineal(idusuario:$idusuario,anio:$anio,mes:$mes,compania:$compania, monedadestino:$monedadestino){
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


        padding:function (labor_anc: number )  {

          labor_anc = screen.width;
          console.log('cc ' + labor_anc);
        return  10;
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


  constructor(public userservice: UserService,
    private apollo: Apollo, private serviceAuth: AuthServiceService,
    public translateService: TranslateService) {
    this.queryLogin = new Subscription();
    this.queryMBLineal = new Subscription();
  }

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

      this.queryMBLineal = this.apollo.watchQuery({
        query: QIMBLINEAL,
        variables: {
          idusuario: this.userservice.responseLogin.idUsuario,
          anio: new Date().getFullYear(),
          mes: this.getCurrenlyMonth(),
          compania: this.userservice.responseLogin.companiaa[0].idCompaniaOdoo,
          monedadestino: this.userservice.responseLogin.companiaa[0].idMonedaEmpresaOdoo
        },
        fetchPolicy: "no-cache"
      }).valueChanges.subscribe((response: any) => {

        if (response.data.margenbruto_lineal.lista_mes && response.data.margenbruto_lineal.lista_anual) {
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
      this.queryLogin = this.apollo.watchQuery({
        query: LOGIN,
        variables: { usuario: this.serviceAuth.userData?.name, clave: this.serviceAuth.userData?.password },
      }).valueChanges.subscribe((response: any) => {
        this.setup();

        let filtro: DataIndicador | null | any = null;
        filtro = localStorage.getItem('filtroAMM');
        if (filtro) {
          filtro = JSON.parse(filtro);
        } else {
          filtro = null;
        }
        this.selectedCoin = filtro.monedaActual;
        this.selectedyear = String(filtro.anioActual);
        this.selectedMonth = filtro.mesActual;

        this.queryMBLineal = this.apollo.watchQuery({
          query: QIMBLINEAL,
          variables: {
            idusuario: this.userservice.responseLogin.idUsuario,
            anio: filtro.anioActual,
            mes: filtro.mesActual,
            compania: this.userservice.responseLogin.companiaa[0].idCompaniaOdoo,
            monedadestino: filtro.monedaActual
          },
          fetchPolicy: "no-cache"
        }).valueChanges.subscribe((response: any) => {

          if (response.data.margenbruto_lineal.lista_mes && response.data.margenbruto_lineal.lista_anual) {
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
              barPercentage: 0.5,
              backgroundColor: '#F08B3B',
              hoverBackgroundColor: '#F08B3B',
            }

            
            this.barChartDataAc[0] = {
              data: listabarAc,
              label: 'VAR. vs.' + (new Date().getFullYear() - 1),
              barPercentage: 0.5,
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
    this.saveFiltros();
    this.listamesMB = [];
    this.listyearVAR = [];
    if (this.userservice.responseLogin) {
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
      this.queryMBLineal = this.apollo.watchQuery({
        query: QIMBLINEAL,
        variables: {
          idusuario: this.userservice.responseLogin.idUsuario,
          anio: Number(this.selectedyear),
          mes: this.selectedMonth,
          compania: this.userservice.responseLogin.companiaa[0].idCompaniaOdoo,
          monedadestino: this.selectedCoin
        },
        fetchPolicy: "no-cache"
      }).valueChanges.subscribe((result: any) => {

        if (result.data.margenbruto_lineal.lista_mes && result.data.margenbruto_lineal.lista_anual) {
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
