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
import { Router } from '@angular/router';
import { UserAuth } from 'src/app/models/userAuth.interface';
import { pageinf } from 'src/app/models/pageinfoo';
import { report } from 'process';


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

const QIPORTAFOLIO = gql`
query  contribucion_del_portafolio($idusuario:Int!,$companiaid:Int!,$categoriacompaniaid:Int!,$tableroid:Int!,$anio:Int!,$mes:String) {
  contribucion_del_portafolio(idusuario:$idusuario,companiaid:$companiaid,categoriacompaniaid:$categoriacompaniaid,tableroid:$tableroid,anio:$anio,mes:$mes){
   
      
    tablero{
      idTablero
      nombreTablero
      estadoTablero
      urlTablero
     
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
  userData_aux: UserAuth | null = null;

  constructor(public userservice: UserService,
    private apollo: Apollo, private serviceAuth: AuthServiceService,private route: Router,
    public translateService: TranslateService) {


      this.route.routeReuseStrategy.shouldReuseRoute = () => false;
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
  public barChartColorsx:string[]=['#02B2F2','#026EE8','#03A696','#037F8C',
  '#2F4673','#1E3259','#0DODOD','#89BAD9'];
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
    legend: {
      position: 'top',
      labels: {
        fontSize: 11,
        usePointStyle: false,
     
      }
    },
    maintainAspectRatio: false,

    scales: {
      yAxes: [{

        ticks: {
          fontSize: 12,

        }
      }],
      xAxes: [{
        ticks: {
          fontColor:'black',
          fontSize: 12,
          fontStyle:'bold'
          
        }
      }],
    },
    plugins: {
      datalabels: {
        color: '#fff',
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

      // this.langDefault = this.userservice.responseLogin.idioma.abreviaturaIdioma;
      // this.translateService.setDefaultLang(this.langDefault);
      // this.translateService.use(this.langDefault);
      // let arrayMeses: any = this.userservice.responseLogin.mess.info_mes;
      // arrayMeses.forEach((item: any) => {
      //   const mes = {
      //     value: String(item.mesid),
      //     viewValue: item.nombre
      //   }
      //   this.months.push(mes);
      // });
     

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


      
      let menuCT: any = localStorage.getItem('menuCT');
      menuCT = JSON.parse(menuCT);
      console.log(menuCT);

      const currentFiltros: DataIndicador = {
        anioActual: Number(this.selectedyear),
        mesActual: this.selectedMonth,
        monedaActual: this.selectedCoin

      }
      localStorage.setItem('filtroAMM', JSON.stringify(currentFiltros));

      
      this.queryPortafolio = this.apollo.query({
        query: QIPORTAFOLIO,
        variables: {
          idusuario: this.userData_aux?.idUsuario,
          companiaid: this.userData_aux?.companiaId,
          categoriacompaniaid: menuCT.categoriacompaniaid,
          tableroid: menuCT.idtablero,
          anio: new Date().getFullYear(),
          mes: this.getCurrenlyMonth()
        },
        fetchPolicy: "no-cache"
      }).subscribe((response: any) => {




        localStorage.removeItem('titulo_izquierdo');
        const pageinf: pageinf = {
          title:response.data.contribucion_del_portafolio.tablero.nombreTablero
        }
        //alert(JSON.stringify(pageinf));
        localStorage.setItem('titulo_izquierdo', JSON.stringify(pageinf));

        (<HTMLHeadingElement>document.getElementById("tit")).innerHTML = response.data.contribucion_del_portafolio.tablero.nombreTablero;



        
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
          this.amoutIncrementedcanvas = 180 + (50 * this.listportafolio.length) + "px";
          this.amoutIncrementedcanvasAc = 180 + (50 * this.listportafolioac.length) + "px";
        
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


      this.userData_aux = null;

      this.userData_aux = this.serviceAuth.Obtener_ls_authuser();
       let menuCT: any = localStorage.getItem('menuCT');
      menuCT = JSON.parse(menuCT);
      console.log(menuCT);




      this.queryLogin = this.apollo.watchQuery({
        query: LOGIN,
        variables: { usuario: this.serviceAuth.userData?.name, clave: this.serviceAuth.userData?.password }
      }).valueChanges.subscribe((response: any) => {
        // this.userservice.responseLogin = response.data.validarlogin;

        // let filtro: DataIndicador | null | any = null;
        // filtro = localStorage.getItem('filtroAMM');
        // if (filtro) {
        //   filtro = JSON.parse(filtro);
        // } else {
        //   filtro = null;
        // }


     
        // this.selectedyear = String(filtro.anioActual);
        // this.selectedMonth = filtro.mesActual;

        // let arrayMeses: any = this.userservice.responseLogin.mess.info_mes;
        // arrayMeses.forEach((item: any) => {
        //   const mes = {
        //     value: String(item.mesid),
        //     viewValue: item.nombre
        //   }
        //   this.months.push(mes);
        // });




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




      
        this.queryPortafolio = this.apollo.watchQuery({
          query: QIPORTAFOLIO,
          variables: {
            
            idusuario: this.userData_aux?.idUsuario,
            companiaid: this.userData_aux?.companiaId,
            categoriacompaniaid: menuCT.categoriacompaniaid,
            tableroid: menuCT.idtablero,
            anio: filtro.anioActual,
            mes: filtro.mesActual
          },
          fetchPolicy: "no-cache"
        }).valueChanges.subscribe((response: any) => {


          localStorage.removeItem('titulo_izquierdo');
          const pageinf: pageinf = {
            title: response.data.contribucion_del_portafolio.tablero.nombreTablero
          }
          //alert(JSON.stringify(pageinf));
          localStorage.setItem('titulo_izquierdo', JSON.stringify(pageinf));

          (<HTMLHeadingElement>document.getElementById("tit")).innerHTML = response.data.contribucion_del_portafolio.tablero.nombreTablero;


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
            this.amoutIncrementedcanvas = 180 + (50 * this.listportafolio.length) + "px";
            this.amoutIncrementedcanvasAc = 180 + (50 * this.listportafolioac.length) + "px";
           
           
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

  private initialSetup() {

    //  this.coins.length=0;
    this.months = [];

    let arraymonedas: any;

    for (let listac of this.userservice.responseLogin.companiaa) {

      if (listac.idCompania == this.userData_aux?.companiaId) {

        arraymonedas = listac.monedass.info_moneda;
//this.placeholderCoin = listac.monedass.descripcion_moneda.nombre;

        //  this.selectedCoinTable = arraymonedas.find((e: any) => e.idMonedaOdoo ==this.userservice.responseLogin.companiaa[0].idMonedaEmpresaOdoo).name;

        let arrayMeses: any = this.userservice.responseLogin.mess.info_mes;
  //      this.placeholderYear = this.userservice.responseLogin.anioo.descripcion_anio.nombre;
    //    this.placeholderMonth = this.userservice.responseLogin.mess.descripcion_mes.nombre;
        //   alert(arraymonedas.length);
        // arraymonedas.forEach((e: any) => {
        //   let coin = {
        //     value: e.idMonedaOdoo,
        //     viewValue: e.name
        //   };

        //   //    this.coins=[];
        //   //  alert(this.coins.length)

        //   this.coins.push(coin);
        // });
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


       
    this.coins = [];




    let arraymonedas: any;

    for (let listac of this.userservice.responseLogin.companiaa) {

      if (listac.idCompania == this.userData_aux?.companiaId) {

        arraymonedas = listac.monedass.info_moneda;
   //     this.placeholderCoin = listac.monedass.descripcion_moneda.nombre;

        //  this.selectedCoinTable = arraymonedas.find((e: any) => e.idMonedaOdoo ==this.userservice.responseLogin.companiaa[0].idMonedaEmpresaOdoo).name;

        let arrayMeses: any = this.userservice.responseLogin.mess.info_mes;
     //   this.placeholderYear = this.userservice.responseLogin.anioo.descripcion_anio.nombre;
      //  this.placeholderMonth = this.userservice.responseLogin.mess.descripcion_mes.nombre;

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

    this.barChartPie = [];
    this.queryPortafolio = this.apollo.query({
      query: QIPORTAFOLIO,
      variables: {
       
        idusuario: this.userData_aux?.idUsuario,
        companiaid: this.userData_aux?.companiaId,
        categoriacompaniaid: menuCT.categoriacompaniaid,
        tableroid: menuCT.idtablero,
        anio: Number(this.selectedyear),
        mes: this.selectedMonth
      },
      fetchPolicy: "no-cache"
    }).subscribe((response: any) => {
      if (response) {
        // this.coins = [];


        localStorage.removeItem('titulo_izquierdo');
        const pageinf: pageinf = {
          title: response.data.contribucion_del_portafolio.tablero.nombreTablero
        }

        localStorage.setItem('titulo_izquierdo', JSON.stringify(pageinf));

        (<HTMLHeadingElement>document.getElementById("tit")).innerHTML = response.data.contribucion_del_portafolio.tablero.nombreTablero;


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
          this.amoutIncrementedcanvas = 180 + (50 * this.listportafolio.length) + "px";
          this.amoutIncrementedcanvasAc = 180 + (50 * this.listportafolioac.length) + "px";
         
         
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
