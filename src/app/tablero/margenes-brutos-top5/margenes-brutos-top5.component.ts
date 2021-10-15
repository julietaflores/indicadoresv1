import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Apollo, QueryRef } from 'apollo-angular';
import gql from 'graphql-tag';
import { UserService } from 'src/app/services/user.service';
import { Label } from 'ng2-charts';
import * as pluginDataLabels from 'chartjs-plugin-datalabels';
import { Subscription } from 'rxjs';
import { ChartOptions } from 'chart.js';
import { AuthServiceService } from 'src/app/services/auth-service.service';
import { GlobalConstants } from 'src/app/GLOBALS/GlobalConstants';
import { TranslateService } from '@ngx-translate/core';
import { DataIndicador } from 'src/app/models/dataIndicador.interface';

const QIMBTOP5 = gql`
query margenbruto_top5($idusuario:Int!,$anio:Int!,$mes:String,$compania:Int!, $monedadestino:Int!) {
  margenbruto_top5(idusuario:$idusuario,anio:$anio,mes:$mes,compania:$compania, monedadestino:$monedadestino){
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
  selector: 'app-margenes-brutos-top5',
  templateUrl: './margenes-brutos-top5.component.html',
  styleUrls: ['./margenes-brutos-top5.component.scss']
})
export class MargenesBrutosTop5Component implements OnInit, OnDestroy {
  coins: any[] = [];
  years: any[] = GlobalConstants.years;
  months: any[] = [];

  private queryTop5: Subscription;//get first list products
  private queryLogin: Subscription;

  listamesMB: MargenBruto[] = [];
  listyearVAR: MargenBruto[] = [];

  // This is line chart
  // bar chart

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
          precision: 2
        }
      }],
    },
    plugins: {
      datalabels: {
        color: 'red',
        anchor: 'center',
        align: 'start',
        display: true,
        precision: 2,
        fontSize: 12,

      },
      labels: {
        fontSize: 12,
        overlap: true,
      }
    }
  };

  
  placeholderYear: String = 'Year';
  placeholderMonth: String = 'Month';
  placeholderCoin: String = 'Currency';

  public barChartLabels: string[] = [

  ];
  public barChartType = 'horizontalBar';
  public barChartLegend = true;

  public barChartData: any[] = [];
  public barChartDataAc: any[] = [];

  public barChartColors: Array<any> = [

  ];

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
    this.queryTop5 = new Subscription();
    this.queryLogin = new Subscription();

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

      this.queryTop5 = this.apollo.query({
        query: QIMBTOP5,
        variables: {
          idusuario: this.userservice.responseLogin.idUsuario,
          anio: new Date().getFullYear(),
          mes: this.getCurrenlyMonth(),
          compania: this.userservice.responseLogin.companiaa[0].idCompaniaOdoo,
          monedadestino: this.userservice.responseLogin.companiaa[0].idMonedaEmpresaOdoo
        },
        fetchPolicy: "network-only"
      }).subscribe((result: any) => {

        if (result.data.margenbruto_top5.lista_mes && result.data.margenbruto_top5.lista_anual) {
          let listabar: any[] = [];
          let listabarAc: any[] = [];
          this.barChartData = [];
          this.barChartDataAc = [];
          this.barChartLabels = [];
          this.listamesMB = [];
          this.listyearVAR = [];

       
        
          let listames = result.data.margenbruto_top5.lista_mes;
          let listaanual = result.data.margenbruto_top5.lista_anual;
          this.dataSourceMes = new MatTableDataSource<MargenBruto>();
          this.dataSourceAcumulado = new MatTableDataSource<MargenBruto>();

          this.amoutIncremented = 150 + (50 * listames.length) + "px";
          this.amoutIncrementedAc = 150 + (50 * listaanual.length) + "px";

          this.amoutIncrementedcanvas = 100 + (50 * listames.length) + "px";
          this.amoutIncrementedcanvasAc = 100 + (50 * listaanual.length) + "px";

          listames.forEach((value: any) => {
            let item = {
              producto: value.nombre,
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
            let item = {
              producto: value.nombre,
              porcentaje_margen: value.porcentaje_margen_actual,
              bps: value.bPS,
              moneda: value.importe_actual
            }
            if (listames.length === 0) {
              this.barChartLabels.push(value.nombre);
            }
            let calculografico = Number(value.calculo_grafico.replace(',', '.'));


            this.listyearVAR.push(item);
            listabarAc.push(calculografico.toFixed(2));

            // listabarAc.push(value.porcentaje_margen_actual);
          });

          this.dataSourceMes = new MatTableDataSource<MargenBruto>(this.listamesMB);



          this.barChartColors.push({ backgroundColor: 'rgb(31,78,120)' });

          this.barChartData[0] = {
            data: listabar,
            label: 'VAR. vs.' + (new Date().getFullYear() - 1)
          }

          this.barChartDataAc[0] = {
            data: listabarAc,
            label: 'VAR. vs.' + (new Date().getFullYear() - 1)
          }
          this.dataSourceAcumulado = new MatTableDataSource<MargenBruto>(this.listyearVAR);

        }

      });

    }
    else {

      this.queryLogin = this.apollo.query({
        query: LOGIN,
        variables: { usuario: this.serviceAuth.userData?.name, clave: this.serviceAuth.userData?.password },
        fetchPolicy: "network-only"
      }).subscribe((response: any) => {
        this.setup();

        let filtro: DataIndicador | null | any = null;
        filtro = localStorage.getItem('filtroAMM');
        if (filtro) {
          filtro = JSON.parse(filtro);
        } else {
          filtro = null;
        }
       

        this.queryTop5 = this.apollo.query({
          query: QIMBTOP5,
          variables: {
            idusuario: this.userservice.responseLogin.idUsuario,
            anio:filtro.anioActual,
            mes: filtro.mesActual,
            compania: this.userservice.responseLogin.companiaa[0].idCompaniaOdoo,
            monedadestino: filtro.monedaActual
          },
          fetchPolicy: "network-only"
        }).subscribe((result: any) => {

          if (result.data.margenbruto_top5.lista_mes && result.data.margenbruto_top5.lista_anual) {
            let listabar: any = [];
            let listabarAc: any = [];
            this.barChartData = [];
            this.barChartDataAc = [];
            this.barChartLabels = [];
            this.listamesMB = [];
            this.listyearVAR = [];

            this.selectedCoin = filtro.monedaActual ;
            this.selectedyear=String(filtro.anioActual);
            this.selectedMonth=filtro.mesActual;

            let listames = result.data.margenbruto_top5.lista_mes;
            let listaanual = result.data.margenbruto_top5.lista_anual;
            this.dataSourceMes = new MatTableDataSource<MargenBruto>();
            this.dataSourceAcumulado = new MatTableDataSource<MargenBruto>();

            this.fixedSize(listames, listaanual);

            listames.forEach((value: any) => {
              let item = {
                producto: value.nombre,
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
              let item = {
                producto: value.nombre,
                porcentaje_margen: value.porcentaje_margen_actual,
                bps: value.bPS,
                moneda: value.importe_actual
              }
              if (listames.length === 0) {
                this.barChartLabels.push(value.nombre);
              }
              this.listyearVAR.push(item);
              let calculografico = Number(value.calculo_grafico.replace(',', '.'));

              listabarAc.push(calculografico.toFixed(2));

            });

            this.dataSourceMes = new MatTableDataSource<MargenBruto>(this.listamesMB);


            this.barChartColors.push({ backgroundColor: 'rgb(31,78,120)' });

            this.barChartData[0] = {
              data: listabar,
              label: 'VAR. vs.' + (new Date().getFullYear() - 1)
            }
            this.barChartDataAc[0] = {
              data: listabarAc,
              label: 'VAR. vs.' + (new Date().getFullYear() - 1)
            }
            this.dataSourceAcumulado = new MatTableDataSource<MargenBruto>(this.listyearVAR);

          }

        });

      });
    }

  }

  displayedColumns = ['producto', 'porcentaje_margen', 'bps', 'importe_actual'];
  dataSourceMes = new MatTableDataSource<MargenBruto>();
  dataSourceAcumulado = new MatTableDataSource<MargenBruto>();

  public chartHovered(e: any): void {
    // console.log(e);
  }
  // events
  public chartClicked(e: any): void {
    // console.log(e);
  }
  fixedSize(listames: any, listaanual: any) {
    this.amoutIncremented = 150 + (50 * listames.length) + "px";
    this.amoutIncrementedAc = 150 + (50 * listaanual.length) + "px";

    this.amoutIncrementedcanvas = 100 + (50 * listames.length) + "px";
    this.amoutIncrementedcanvasAc = 100 + (50 * listaanual.length) + "px";
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
  getAbsoluto(value: number) {
    return Math.abs(value);
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
      this.setup();
      // this.selectedCoin = this.userservice.responseLogin.companiaa[0].idMonedaEmpresaOdoo;
      this.queryTop5 = this.apollo.query({
        query: QIMBTOP5,
        variables: {
          idusuario: this.userservice.responseLogin.idUsuario,
          anio: Number(this.selectedyear),
          mes: this.selectedMonth,
          compania: this.userservice.responseLogin.companiaa[0].idCompaniaOdoo,
          monedadestino: this.selectedCoin
        },
        fetchPolicy: "network-only"
      }).subscribe((result: any) => {

        if (result.data.margenbruto_top5.lista_mes && result.data.margenbruto_top5.lista_anual) {
          let listabar: any = [];
          let listabarAc: any[] = [];
          this.barChartLabels = [];
          this.barChartData = [];
          this.listamesMB = [];
          this.listyearVAR = [];
          let listames = result.data.margenbruto_top5.lista_mes;
          let listaanual = result.data.margenbruto_top5.lista_anual;
          this.dataSourceMes = new MatTableDataSource<MargenBruto>();
          this.dataSourceAcumulado = new MatTableDataSource<MargenBruto>();

          this.fixedSize(listames, listaanual);

          listames.forEach((value: any) => {
            let item = {
              producto: value.nombre,
              porcentaje_margen: value.porcentaje_margen_actual,
              bps: value.bPS,
              moneda: value.importe_actual
            }
            let calculograficomes = Number(value.calculo_grafico.replace(',', '.'));

            this.listamesMB.push(item);

            listabar.push(calculograficomes.toFixed(2));
            this.barChartLabels.push(value.nombre);
          });
          listaanual.forEach((value: any) => {
            let item = {
              producto: value.nombre,
              porcentaje_margen: value.porcentaje_margen_actual,
              bps: value.bPS,
              moneda: value.importe_actual
            }
            if (listames.length === 0) {
              this.barChartLabels.push(value.nombre);
            }
            let calculografico = Number(value.calculo_grafico.replace(',', '.'));

            this.listyearVAR.push(item);
            listabarAc.push(calculografico.toFixed(2));

            // listabarAc.push(value.porcentaje_margen_actual);
          });

          this.dataSourceMes = new MatTableDataSource<MargenBruto>(this.listamesMB);



          this.barChartColors.push({ backgroundColor: 'rgb(31,78,120)' });

          this.barChartData[0] = {
            data: listabar,
            label: 'VAR. vs.' + (new Date().getFullYear() - 1)
          }

          this.barChartDataAc[0] = {
            data: listabarAc,
            label: 'VAR. vs.' + (new Date().getFullYear() - 1)
          }
          this.dataSourceAcumulado = new MatTableDataSource<MargenBruto>(this.listyearVAR);

        }

      });
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

  ngOnDestroy(): void {
    this.queryTop5.unsubscribe();

  }

}

export interface MargenBruto {
  producto: string;
  porcentaje_margen: string;
  bps: string;
  moneda: number;
}