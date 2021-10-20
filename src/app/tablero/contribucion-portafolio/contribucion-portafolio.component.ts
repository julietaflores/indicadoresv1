import { Component, OnInit } from '@angular/core';
import { ChartDataSets, ChartOptions, ChartType } from 'chart.js';
import { Colors, Label } from 'ng2-charts';
import gql from 'graphql-tag';
import * as pluginDataLabels from 'chartjs-plugin-datalabels';
import { Subscription } from 'rxjs';
import { GlobalConstants } from 'src/app/GLOBALS/GlobalConstants';
import { UserService } from 'src/app/services/user.service';
import { Apollo } from 'apollo-angular';
import { AuthServiceService } from 'src/app/services/auth-service.service';
import { TranslateService } from '@ngx-translate/core';
import { DataIndicador } from 'src/app/models/dataIndicador.interface';


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
const QIPORTAFOLIO = gql`
query  contribucion_del_portafolio($idusuario:Int!,$anio:Int!,$mes:String,$compania:Int!) {
  contribucion_del_portafolio(idusuario:$idusuario,anio:$anio,mes:$mes,compania:$compania){
   
      
    tablero{
      idTablero
      nombreTablero
      estadoTablero
      urlTablero
      idCategoria
      
    }
    
    portafolio_Descripcions{
      indicador{
        idIndicador
        nombreIndicador
        estadoIndicador
        iDTablero
      }
      
      lista_informacion{
        lista_mes{
            id
          descripcion
          importe_actual
          importe_porcentaje
          coste_actual
          coste_porcentaje
          cantidad_actual
          cantidad_porcentaje
          porcentaje_margen_actual
          porcentaje_margen_actual_porcentaje
      
          
          
        }
        lista_anual{
         id
          descripcion
          importe_actual
          importe_porcentaje
          coste_actual
          coste_porcentaje
          cantidad_actual
          cantidad_porcentaje
          porcentaje_margen_actual
          porcentaje_margen_actual_porcentaje
          
        }
      }
    }
  
  }

}
`;
@Component({
  selector: 'app-contribucion-portafolio',
  templateUrl: './contribucion-portafolio.component.html',
  styleUrls: ['./contribucion-portafolio.component.scss']
})
export class ContribucionPortafolioComponent implements OnInit {

  constructor(public userservice: UserService,
    private apollo: Apollo, private serviceAuth: AuthServiceService,
    public translateService: TranslateService) {
    this.queryPortafolio = new Subscription();
    this.queryLogin = new Subscription();
  }
  itemdata1: any = [];
  itemdata2: any = [];
  listportafolio: any = [];
  listportafoliomes: any = [];//lista porcentajes torta
  listportafolioac: any = [];//lista porcentajes torta

  barChartPie: any = [];
  listChartsTop5: any = [];

  listlabel: string[] = [];
  listlabelyear: string[] = [];
  langDefault: any = '';

  selectedyear = String(new Date().getFullYear());
  selectedMonth = String(this.getCurrenlyMonth());
  MesActual: any = this.getCurrenlyMonth();
  selectedCoin = 0;

 

  private queryPortafolio: Subscription;
  private queryLogin: Subscription;
  amoutIncrementedcanvas: any;
  amoutIncrementedcanvasAc: any;

  coins: any[] = [];
  years: any[] = GlobalConstants.years;
  months: any[] = [];
  // Pie
  public barChartLabels: Label[] = ['VENTAS', 'VOLUMEN', 'MARGEN'];
  public barChartData: ChartDataSets[] = [];
  public barChartDataYear: ChartDataSets[] = [];
  public barChartColorsx:string[]=['#FF5733','yellow','blue', 'red','pink'];
  public colors = [
    { // 1st Year.
      backgroundColor: ''
    },
    { // 2nd Year.
      backgroundColor: '#F033FF'
    },
    { // 2nd Year.
      backgroundColor: '#0EEA3F'
    }
  ]

  public barChartType: ChartType = 'bar';
  public barChartOptions: ChartOptions = {
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
        align: 'center',
        // padding: function (labor_anc: any) {
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
        //       return 7;
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
          return Number.parseFloat(value).toFixed(2) + "%";
        },
      }
    }
  };

  public barChartLegend = true;
  public barChartPlugins = [];


  ngOnInit(): void {
    if (this.userservice.responseLogin) {

      this.langDefault = this.userservice.responseLogin.idioma.abreviaturaIdioma;
      this.translateService.setDefaultLang(this.langDefault);
      this.translateService.use(this.langDefault);
      let arrayMeses: any = this.userservice.responseLogin.mess.info_mes;
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
      this.queryPortafolio = this.apollo.query({
        query: QIPORTAFOLIO,
        variables: {
          idusuario: this.userservice.responseLogin.idUsuario,
          anio: new Date().getFullYear(),
          mes:  this.getCurrenlyMonth(),
          compania: this.userservice.responseLogin.companiaa[0].idCompaniaOdoo
        },
        fetchPolicy: "no-cache"
      }).subscribe((response: any) => {
        let indicadores = response.data.contribucion_del_portafolio.portafolio_Descripcions;
        this.listportafolio=[];
        indicadores.forEach((item: any) => {
          this.listportafoliomes = [];
          this.listportafolioac = [];
         
         
 
          this.listportafoliomes = item.lista_informacion[0].lista_mes;
  
          console.log('verr '+this.listportafoliomes);
          if (this.listportafoliomes == null) {
            this.listportafoliomes = [];
          }
          this.listportafolioac = item.lista_informacion[0].lista_anual;
          if (this.listportafolioac == null) {
            this.listportafolioac = [];
          }

          let barChartData:ChartDataSets[]=[];

         
          let ix=0;
          this.listportafoliomes.forEach((item: any) => {
             let listamesbar = [];

              
              
        
             listamesbar.push(Number(item.importe_porcentaje.replace(",", ".")));
             listamesbar.push(Number(item.cantidad_porcentaje.replace(",", ".")));
             listamesbar.push(Number(item.porcentaje_margen_actual_porcentaje.replace(",", ".")));


    


             let itemdata = {
              data: listamesbar,
              label: item.descripcion,
              stack: 'a',
              backgroundColor:this.barChartColorsx[ix],
              hoverBackgroundColor: this.barChartColorsx[ix],
            }

            console.log('ver '+JSON.stringify(itemdata));

            barChartData.push(itemdata);

          
           ix++;
          });

         





          let iy=0;
          let barChartDataYear:ChartDataSets[]=[];
           this.listportafolioac.forEach((item: any) => {
            let listaanualbar = [];
            listaanualbar.push(Number(item.importe_porcentaje.replace(",", ".")));
            listaanualbar.push(Number(item.cantidad_porcentaje.replace(",", ".")));
            listaanualbar.push(Number(item.porcentaje_margen_actual_porcentaje.replace(",", ".")));
        
            let itemdata = {
              data: listaanualbar,
              label: item.descripcion,
              stack: 'a',
              backgroundColor:this.barChartColorsx[iy],
              hoverBackgroundColor: this.barChartColorsx[iy]
            }

            barChartDataYear.push(itemdata);
            iy++;
          });
          this.amoutIncrementedcanvas = 100 + (50 * this.listportafolio.length) + "px";
          this.amoutIncrementedcanvasAc = 100 + (50 * this.listportafolioac.length) + "px";
        
          let barChartPortafolio = {
            name: item.indicador.nombreIndicador,
            listPie: barChartData,
            listPieAc: barChartDataYear,
            //labels: this.barChartLabels
          }
          this.listportafolio.push(barChartPortafolio);
           

        });
        console.log(this.listportafolio);

      });


    }
    else {
      this.queryLogin = this.apollo.watchQuery({
        query: LOGIN,
        variables: { usuario: this.serviceAuth.userData?.name, clave: this.serviceAuth.userData?.password }
      }).valueChanges.subscribe((response: any) => {
        this.userservice.responseLogin = response.data.validarlogin;

        let filtro: DataIndicador | null | any = null;
        filtro = localStorage.getItem('filtroAMM');
        if (filtro) {
          filtro = JSON.parse(filtro);
        } else {
          filtro = null;
        }


     
        this.selectedyear = String(filtro.anioActual);
        this.selectedMonth = filtro.mesActual;

        let arrayMeses: any = this.userservice.responseLogin.mess.info_mes;
        arrayMeses.forEach((item: any) => {
          const mes = {
            value: String(item.mesid),
            viewValue: item.nombre
          }
          this.months.push(mes);
        });
      
        this.queryPortafolio = this.apollo.watchQuery({
          query: QIPORTAFOLIO,
          variables: {
            idusuario: this.userservice.responseLogin.idUsuario,
            anio: filtro.anioActual,
            mes: filtro.mesActual,
            compania: this.userservice.responseLogin.companiaa[0].idCompaniaOdoo
          },
          fetchPolicy: "no-cache"
        }).valueChanges.subscribe((response: any) => {

          this.langDefault = this.userservice.responseLogin.idioma.abreviaturaIdioma;

       
          this.translateService.setDefaultLang(this.langDefault);
          this.translateService.use(this.langDefault);
          let indicadores = response.data.contribucion_del_portafolio.portafolio_Descripcions;
          this.listportafolio=[];
          indicadores.forEach((item: any) => {
 
            this.listportafoliomes = [];
            this.listportafolioac = [];
           

            this.listportafoliomes = item.lista_informacion[0].lista_mes;
    
            if ( this.listportafoliomes == null) {
               this.listportafoliomes = [];
            }
            this.listportafolioac= item.lista_informacion[0].lista_anual;
            if ( this.listportafolioac== null) {
               this.listportafolioac= [];
            }
  
            let barChartData:ChartDataSets[]=[];
            
            let ix=0;
            this.listportafoliomes.forEach((item: any) => {
              let listamesbar = [];
  
              
              listamesbar.push(Number(item.importe_porcentaje.replace(",", ".")));
              listamesbar.push(Number(item.cantidad_porcentaje.replace(",", ".")));
              listamesbar.push(Number(item.porcentaje_margen_actual_porcentaje.replace(",", ".")));
              
         
              let itemdata = {
                data: listamesbar,
                label: item.descripcion,
                stack: 'a',
                backgroundColor:this.barChartColorsx[ix],
                hoverBackgroundColor: this.barChartColorsx[ix],
              }
              barChartData.push(itemdata);
            
              this.barChartData.push(itemdata);
              ix++;
            });

            let barChartDataYear:ChartDataSets[]=[];

            let iy=0;
            this.listportafolioac.forEach((item: any) => {
              let listaanualbar = [];
              listaanualbar.push(Number(item.importe_porcentaje.replace(",", ".")));
              listaanualbar.push(Number(item.cantidad_porcentaje.replace(",", ".")));
              listaanualbar.push(Number(item.porcentaje_margen_actual_porcentaje.replace(",", ".")));
           
              let itemdata = {
                data: listaanualbar,
                label: item.descripcion,
                stack: 'a',
                backgroundColor:this.barChartColorsx[iy],
                hoverBackgroundColor: this.barChartColorsx[iy]
              }
  
              barChartDataYear.push(itemdata);
              iy++;
            });
            this.amoutIncrementedcanvas = 100 + (50 * this.listportafolio.length) + "px";
            this.amoutIncrementedcanvasAc = 100 + (50 * this.listportafolioac.length) + "px";
           
           
            let barChartPortafolio = {
              name: item.indicador.nombreIndicador,
              listPie: barChartData,
              listPieAc: barChartDataYear,
              //labels: this.barChartLabels
            }
            this.listportafolio.push(barChartPortafolio);
             
  
          });

        });
      });
    }
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
  // events
  public chartClicked(e: any): void {
    // console.log(e);
  }

  public chartHovered(e: any): void {
    // console.log(e);
  }
  ngOnDestroy(): void {
    // this.queryPie.unsubscribe();
    this.queryPortafolio.unsubscribe();
    // this.queryTop5.unsubscribe();
  }
  private refreshQuery() {
    const currentFiltros: DataIndicador = {
      anioActual: Number(this.selectedyear),
      mesActual: this.selectedMonth,
      monedaActual: this.selectedCoin

    }
    localStorage.removeItem('filtroAMM');
    localStorage.setItem('filtroAMM', JSON.stringify(currentFiltros));

    this.barChartPie = [];
    this.queryPortafolio = this.apollo.query({
      query: QIPORTAFOLIO,
      variables: {
        idusuario: this.userservice.responseLogin.idUsuario,
        anio: Number(this.selectedyear),
        mes: this.selectedMonth,
        compania: this.userservice.responseLogin.companiaa[0].idCompaniaOdoo
      },
      fetchPolicy: "no-cache"
    }).subscribe((response: any) => {
      if (response) {
        // this.coins = [];
      let arrayMeses: any = this.userservice.responseLogin.mess.info_mes;
      
   
      arrayMeses.forEach((item: any) => {
        const mes = {
          value: String(item.mesid),
          viewValue: item.nombre
        }
        this.months.push(mes);
      });
      this.langDefault = this.userservice.responseLogin.idioma.abreviaturaIdioma;

        // alert("es dioma actual "+ this.langDefault);
        this.translateService.setDefaultLang(this.langDefault);
        this.translateService.use(this.langDefault);
        let indicadores = response.data.contribucion_del_portafolio.portafolio_Descripcions;
   
        this.listportafolio=[];
       // let nameIndicador = response.data.contribucion_del_portafolio.portafolio_Descripcion
        indicadores.forEach((item: any) => {
     
      
          this.listportafoliomes = [];
          this.listportafolioac = [];
         

 
          this.listportafoliomes = item.lista_informacion[0].lista_mes;
 
          if (this.listportafoliomes == null) {
            this.listportafoliomes = [];
          }
          this.listportafolioac = item.lista_informacion[0].lista_anual;
          if ( this.listportafolioac== null) {
             this.listportafolioac= [];
          }

          let barChartData:ChartDataSets[]=[];
          let ix=0;
          this.listportafoliomes.forEach((item: any) => {
            let listamesbar = [];

            
            listamesbar.push(Number(item.importe_porcentaje.replace(",", ".")));
            listamesbar.push(Number(item.cantidad_porcentaje.replace(",", ".")));
            listamesbar.push(Number(item.porcentaje_margen_actual_porcentaje.replace(",", ".")));
           
            let itemdata = {
              data: listamesbar,
              label: item.descripcion,
              stack: 'a',
              backgroundColor:this.barChartColorsx[ix],
              hoverBackgroundColor: this.barChartColorsx[ix],
            }
            barChartData.push(itemdata);
          
            this.barChartData.push(itemdata);
            ix++;
           
          });
          let barChartDataYear:ChartDataSets[]=[];
          let iy=0;
          this.listportafolioac.forEach((item: any) => {
            let listaanualbar = [];
            listaanualbar.push(Number(item.importe_porcentaje.replace(",", ".")));
            listaanualbar.push(Number(item.cantidad_porcentaje.replace(",", ".")));
            listaanualbar.push(Number(item.porcentaje_margen_actual_porcentaje.replace(",", ".")));
           // this.listportafoliomes.push(Number(item.importe_actual.replace(",", ".")));
           
            let itemdata = {
              data: listaanualbar,
              label: item.descripcion,
              stack: 'a',
              backgroundColor:this.barChartColorsx[iy],
              hoverBackgroundColor: this.barChartColorsx[iy],
            }

            barChartDataYear.push(itemdata);
            iy++;
          });
          this.amoutIncrementedcanvas = 100 + (50 * this.listportafolio.length) + "px";
          this.amoutIncrementedcanvasAc = 100 + (50 * this.listportafolioac.length) + "px";
         
         
          let barChartPortafolio = {
            name: item.indicador.nombreIndicador,
            listPie: barChartData,
            listPieAc: barChartDataYear,
            //labels: this.barChartLabels
          }
          this.listportafolio.push(barChartPortafolio);
           

        });

     
      }

    });

  }




}
