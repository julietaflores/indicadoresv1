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
const QIMBREGION = gql`
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
    plugins: {
      datalabels: {
        color: '#ffffff',
        formatter: function (value: any) {
          return Number.parseFloat(value).toFixed(2);
        },
      }
    }
  };

  public barChartLabels: string[] = [

  ];
  public barChartType = 'horizontalBar';
  public barChartLegend = true;

  public barChartData: any[] = [];
  public barChartDataAc: any[] = [];

  public barChartColors: Array<any> = [

  ];
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

  constructor(public userservice: UserService,
    private apollo: Apollo, private serviceAuth: AuthServiceService,
    public translateService: TranslateService) {
    this.queryMesRegion = new Subscription();
    this.queryLogin = new Subscription();
  }

  ngOnInit(): void {
    if (this.userservice.responseLogin) {
      this.selectedCoin = this.userservice.responseLogin.companiaa[0].idMonedaEmpresaOdoo;
      let arrayMeses: any = this.userservice.responseLogin.mess.info_mes;
      let arraymonedas = this.userservice.responseLogin.monedass.info_moneda;
      this.selectedCoinTable = arraymonedas.find((e: any) => e.idMonedaEmpresaOdoo ==
        this.userservice.responseLogin.companiaa[0].idMonedaEmpresaOdoo).name;
      this.placeholderYear = this.userservice.responseLogin.anioo.descripcion_anio.nombre;
      this.placeholderMonth = this.userservice.responseLogin.mess.descripcion_mes.nombre;
      this.placeholderCoin = this.userservice.responseLogin.monedass.descripcion_moneda.nombre;

      this.langDefault = this.userservice.responseLogin.idioma.abreviaturaIdioma;

      // alert("es dioma actual "+ this.langDefault);
      this.translateService.setDefaultLang(this.langDefault);
      this.translateService.use(this.langDefault);
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
      const currentFiltros: DataIndicador = {
        anioActual: Number(this.selectedyear),
        mesActual: this.selectedMonth,
        monedaActual: this.selectedCoin

      }
      localStorage.setItem('filtroAMM', JSON.stringify(currentFiltros));


      this.queryMesRegion = this.apollo.query({
        query: QIMBREGION,
        variables: {
          idusuario: this.userservice.responseLogin.idUsuario,
          anio: new Date().getFullYear(),
          mes: this.getCurrenlyMonth(),
          compania: this.userservice.responseLogin.companiaa[0].idCompaniaOdoo,
          monedadestino: this.userservice.responseLogin.companiaa[0].idMonedaEmpresaOdoo
        },
        fetchPolicy: "no-cache"
      }).subscribe((resultado: any) => {
        if (resultado.data.margenbruto_region.lista_mes && resultado.data.margenbruto_region.lista_anual) {
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

          this.barChartColors.push({ backgroundColor: 'rgb(31,78,120)' });

          this.barChartData[0] = {
            data: listabar,
            label: 'VAR. vs.' + (new Date().getFullYear() - 1),
            barThickness: 40,
            barPercentage: 0.5
          }
          this.barChartDataAc[0] = {
            data: listabaryear,
            label: 'VAR. vs.' + (new Date().getFullYear() - 1)
          }

          this.dataSourceMes = new MatTableDataSource<MargenBrutoRegion>(this.listamesMB);

        }


      });

    }
    else {
      this.queryLogin = this.apollo.query({
        query: LOGIN,
        variables: { usuario: this.serviceAuth.userData?.name, clave: this.serviceAuth.userData?.password },
        fetchPolicy: "no-cache"
      }).subscribe((response: any) => {
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
        this.userservice.responseLogin = response.data.validarlogin;
        let arraymonedas = this.userservice.responseLogin.monedass.info_moneda;
        let arrayMeses: any = this.userservice.responseLogin.mess.info_mes;
        this.selectedCoinTable = arraymonedas.find((e: any) => e.idMonedaEmpresaOdoo ==
        this.userservice.responseLogin.companiaa[0].idMonedaEmpresaOdoo).name;
        this.langDefault = this.userservice.responseLogin.idioma.abreviaturaIdioma;

        this.placeholderYear = this.userservice.responseLogin.anioo.descripcion_anio.nombre;
        this.placeholderMonth = this.userservice.responseLogin.mess.descripcion_mes.nombre;
        this.placeholderCoin = this.userservice.responseLogin.monedass.descripcion_moneda.nombre;
  

        // alert("es dioma actual "+ this.langDefault);
        this.translateService.setDefaultLang(this.langDefault);
        this.translateService.use(this.langDefault);

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

        this.queryMesRegion = this.apollo.query({
          query: QIMBREGION,
          variables: {
            idusuario: this.userservice.responseLogin.idUsuario,
            anio: filtro.anioActual,
            mes: filtro.mesActual,
            compania: this.userservice.responseLogin.companiaa[0].idCompaniaOdoo,
            monedadestino: filtro.monedaActual
          },
          fetchPolicy: "no-cache"
        }).subscribe((result: any) => {
          if (result.data.margenbruto_region.lista_mes && result.data.margenbruto_region.lista_anual) {
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
            this.dataSourceAcumulado = new MatTableDataSource<MargenBrutoRegion>(this.listyearVAR);
            this.barChartColors.push({ backgroundColor: 'rgb(31,78,120)' });

            this.barChartData[0] = {
              data: listabar,
              label: 'VAR. vs.' + (new Date().getFullYear() - 1),
              barThickness: 40,
              barPercentage: 0.5
            }
            this.barChartDataAc[0] = {
              data: listabaryear,
              label: 'VAR. vs.' + (new Date().getFullYear() - 1)
            }

            this.dataSourceMes = new MatTableDataSource<MargenBrutoRegion>(this.listamesMB);

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
    this.refreshQuery();
  }
  ngOnDestroy() {
    this.queryMesRegion.unsubscribe()
  }
  getAbsoluto(value: number) {
    return Math.abs(value);
  }
  private refreshQuery() {
    const currentFiltros: DataIndicador = {
      anioActual: Number(this.selectedyear),
      mesActual: this.selectedMonth,
      monedaActual: this.selectedCoin

    }
    localStorage.removeItem('filtroAMM');
    localStorage.setItem('filtroAMM', JSON.stringify(currentFiltros));

    if (this.userservice.responseLogin) {
      this.coins = [];
      this.barChartLabels = [];
      this.barChartColors=[];
      let arraymonedas = this.userservice.responseLogin.monedass.info_moneda;
      this.selectedCoinTable = arraymonedas.find((e: any) => e.idMonedaEmpresaOdoo ==
        this.selectedCoin).name
      arraymonedas.forEach((e: any) => {
        let coin = {
          value: e.idMonedaEmpresaOdoo,
          viewValue: e.name
        };
        this.coins.push(coin);
      });
      this.queryMesRegion = this.apollo.query({
        query: QIMBREGION,
        variables: {
          idusuario: this.userservice.responseLogin.idUsuario,
          anio: Number(this.selectedyear),
          mes: this.selectedMonth,
          compania: this.userservice.responseLogin.companiaa[0].idCompaniaOdoo,
          monedadestino: this.selectedCoin
        },
        fetchPolicy: "no-cache"
      }).subscribe((result: any) => {
        if (result.data.margenbruto_region.lista_mes && result.data.margenbruto_region.lista_anual) {
         
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
          this.barChartColors.push({ backgroundColor: 'rgb(31,78,120)' });
          this.dataSourceAcumulado = new MatTableDataSource<MargenBrutoRegion>(this.listyearVAR);

         // this.barChartColors.push({ backgroundColor: 'rgb(31,78,120)' });
          
          this.barChartData[0] = {
            data: listabar,
            label: 'VAR. vs.' + (new Date().getFullYear() - 1),
            barThickness: 40,
            barPercentage: 0.5
          }
         
          this.barChartDataAc[0] = {
            data: listabaryear,
            label: 'VAR. vs.' + (new Date().getFullYear() - 1),
            barThickness: 40,
            barPercentage: 0.5
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


