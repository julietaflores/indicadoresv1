import { Component, OnDestroy, OnInit } from '@angular/core';
import { GlobalConstants } from 'src/app/GLOBALS/GlobalConstants';
import { UserService } from 'src/app/services/user.service';
import { Apollo, QueryRef } from 'apollo-angular';
import gql from 'graphql-tag';
import { Label } from 'ng2-charts';
import * as pluginDataLabels from 'chartjs-plugin-datalabels';
import { Subscription } from 'rxjs';
import { AuthServiceService } from 'src/app/services/auth-service.service';
import { TranslateService } from '@ngx-translate/core';
import { DataIndicador } from 'src/app/models/dataIndicador.interface';
import { UserAuth } from 'src/app/models/userAuth.interface';
import { pageinf } from 'src/app/models/pageinfoo';
import { Router } from '@angular/router';


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



const QICV = gql`
query composicion_ventas($idusuario:Int!,$companiaid:Int!,$categoriacompaniaid:Int!,$tableroid:Int!,$anio:Int!,$mes:String) {
  composicion_ventas(idusuario:$idusuario,companiaid:$companiaid,categoriacompaniaid:$categoriacompaniaid,tableroid:$tableroid,anio:$anio,mes:$mes){
    tablero{
      idTablero
      nombreTablero
      estadoTablero
      urlTablero
      
    }
    lista{
     indicador{
        idIndicador
        nombreIndicador
      estadoIndicador
      iDTablero
      }
      
     lista_mes{
      idPosicion
      nombre
      porcentajetorta
    }
    
      lista_anual{
      idPosicion
      nombre
      porcentajetorta
    }
      
      
      
    }
  } 
}
`;
@Component({
  selector: 'app-composicion-ventas',
  templateUrl: './composicion-ventas.component.html',
  styleUrls: ['./composicion-ventas.component.scss']
})
export class ComposicionVentasComponent implements OnInit, OnDestroy {
  userData_aux: UserAuth | null = null;


  constructor(public userservice: UserService,
    private apollo: Apollo, private serviceAuth: AuthServiceService, public translate: TranslateService,private route: Router) {
    this.queryCompositionV = new Subscription();
    this.queryLogin = new Subscription();
    this.route.routeReuseStrategy.shouldReuseRoute = () => false;
    
  }
  coins: any[] = [];
  
  listIndicadores: any = [];//Lista Indicadores Composicion Ventas
  listpercentagesmes: any = [];//lista porcentajes torta
  listpercentagesyear: any = [];//lista porcentajes torta

  listChartsPie: any = [];

  listlabel: string[] = [];
  listlabelyear: string[] = [];

  colors: String[] = [];
  selectedyear = String(new Date().getFullYear());
  selectedMonth = String(this.getCurrenlyMonth());
  MesActual: any = this.getCurrenlyMonth();
  selectedCoin = 0;
  placeholderYear: String = 'Year';
  placeholderMonth: String = 'Month';



  pieChartOptions = {
    responsive: true,
    legend: {
      position: 'top',
    },
    plugins: {
      datalabels: {
        color: '#ffffff',
        formatter: function (value: any) {
          return Number.parseFloat(value).toFixed(2) + "%";
        },
      }
    }
    // plugins: {
    //   datalabels: {
    //     formatter: (value, ctx) => {
    //       const label = ctx.chart.data.labels[ctx.dataIndex];
    //       return label;
    //     },
    //   },
    // }
  }
  public pieChartPlugins = [pluginDataLabels];

  private queryCompositionV: Subscription;
  private queryLogin: Subscription;
  // dataSource = new MatTableDataSource<PerformanceGL>(ELEMENT_DATA);
  // dataSourceAc = new MatTableDataSource<PerformanceGLAcumulado>(ELEMENT_DATA_AC);
  // dataSourceVARS = new MatTableDataSource<VarPerformance>(ELEMENT_VAR);
  // dataSourceVARSAc = new MatTableDataSource<VarPerformance>(ELEMENT_VAR_AC);
  // coins: any[] = [];
  years: any[] = GlobalConstants.years;
  months: any[] = [];
  // Pie
  public pieChartLabels: string[] = [];
  public pieChartLabelsYear: string[] = [];
  //public pieChartData: number[] = [];
  public pieChartData: number[] = [];
  public pieChartDataYear: number[] = [];
  // public pieChartData: number[] = [78.09, 20.95, 0.93, 0.03];
  public pieChartType = 'pie';
  langDefault: any = '';



  ngOnInit(): void {
    if (this.userservice.responseLogin) {



      (<HTMLHeadingElement>document.getElementById("tit")).innerHTML='';     

      this.userData_aux= this.serviceAuth.Obtener_ls_authuser();
    
      this.langDefault = this.userData_aux?.language;
      this.translate.setDefaultLang(this.langDefault);
      this.translate.use(this.langDefault);

     
      this.initialSetup();

      this.selectedCoin = this.userData_aux?.ls_idMonedaOdoo;
     


    //  this.langDefault = this.userservice.responseLogin.idioma.abreviaturaIdioma;

      // alert("es dioma actual "+ this.langDefault);
 //     this.translate.setDefaultLang(this.langDefault);
   //   this.translate.use(this.langDefault);
      // this.selectedCoin = this.userservice.responseLogin.companiaa[0].idMonedaEmpresaOdoo;
      // let arraymonedas = this.userservice.responseLogin.monedass.info_moneda;
  //    let arrayMeses: any = this.userservice.responseLogin.mess.info_mes;

      
      const currentFiltros: DataIndicador = {
        anioActual: Number(this.selectedyear),
        mesActual: this.selectedMonth,
        monedaActual: this.selectedCoin

      }

      let menuCT: any = localStorage.getItem('menuCT');
      menuCT = JSON.parse(menuCT);
      console.log(menuCT);


      localStorage.setItem('filtroAMM', JSON.stringify(currentFiltros));


//      this.placeholderYear = this.userservice.responseLogin.anioo.descripcion_anio.nombre;
//      this.placeholderMonth = this.userservice.responseLogin.mess.descripcion_mes.nombre;


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

      this.queryCompositionV = this.apollo.query({
        query: QICV,
        variables: {


          idusuario: this.userData_aux?.idUsuario,
          companiaid:this.userData_aux?.companiaId,
          categoriacompaniaid:menuCT.categoriacompaniaid,
          tableroid:menuCT.idtablero,
          anio: new Date().getFullYear(),
          mes: this.getCurrenlyMonth()
        },
        fetchPolicy: "network-only"
      }).subscribe((response: any) => {
        if (response) {
          this.listChartsPie = [];
          let indicadores = response.data.composicion_ventas.lista;



          localStorage.removeItem('Titulo_isquierdo');
          const pageinf: pageinf = {
            title:response.data.composicion_ventas.tablero.nombreTablero
          }
          //alert(JSON.stringify(pageinf));
          localStorage.setItem('Titulo_isquierdo', JSON.stringify(pageinf));

          (<HTMLHeadingElement>document.getElementById("tit")).innerHTML = response.data.composicion_ventas.tablero.nombreTablero;



          indicadores.forEach((item: any) => {
            this.listpercentagesmes = [];
            this.listpercentagesyear = [];
            let pieChartData: any[] = [];
            let pieChartDataYear: any[] = [];
            let pieChartLabels: string[] = [];
            let listames = item.lista_mes;
            if (listames == null) {
              listames = [];
            }
            let listaanual = item.lista_anual;
            if (listaanual == null) {
              listaanual = [];
            }

            listames.forEach((item: any) => {
              this.listpercentagesmes.push(Number(item.porcentajetorta.replace(",", ".")));
              pieChartLabels.push(item.nombre);
            });

            listaanual.forEach((item: any) => {
              this.listpercentagesyear.push(Number(item.porcentajetorta.replace(",", ".")));
              if (listames.length == 0) {
                pieChartLabels.push(item.nombre);
              }

            });
            pieChartData = this.listpercentagesmes;

            pieChartDataYear = this.listpercentagesyear;

            let pieRegion = {
              name: item.indicador.nombreIndicador,
              listPie: pieChartData,
              listPieAc: pieChartDataYear,
              labels: pieChartLabels
            }
            this.listChartsPie.push(pieRegion);

          });
        }

      });


    }
    else {

      this.userData_aux= null;
      this.userData_aux= this.serviceAuth.Obtener_ls_authuser();
  
      let menuCT: any = localStorage.getItem('menuCT');
      menuCT = JSON.parse(menuCT);
      console.log(menuCT);



      this.queryLogin = this.apollo.watchQuery({
        query: LOGIN,
        variables: { usuario: this.serviceAuth.userData?.name, clave: this.serviceAuth.userData?.password },
        
      }).valueChanges.subscribe((response: any) => {
        this.userservice.responseLogin = response.data.validarlogin;
      
       
        let filtro:DataIndicador| null | any = null;
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

   // alert(filtro.monedaActual)
     
      // this.selectedCoin = filtro.monedaActual;
     //  this.selectedyear = String(filtro.anioActual);
     //  this.selectedMonth = filtro.mesActual;
       

      //  this.langDefault = this.userservice.responseLogin.idioma.abreviaturaIdioma;

        // alert("es dioma actual "+ this.langDefault);
       // this.translate.setDefaultLang(this.langDefault);
       // this.translate.use(this.langDefault);
       // this.selectedCoin = filtro.monedaActual ;
      //  this.selectedyear=String(filtro.anioActual);
      //  this.selectedMonth=filtro.mesActual;
      
        //this.selectedCoin = this.userservice.responseLogin.companiaa[0].idMonedaEmpresaOdoo;
        //let arraymonedas = this.userservice.responseLogin.monedass.info_moneda;
      //  let arrayMeses: any = this.userservice.responseLogin.mess.info_mes;
      //  this.placeholderYear = this.userservice.responseLogin.anioo.descripcion_anio.nombre;
      //  this.placeholderMonth = this.userservice.responseLogin.mess.descripcion_mes.nombre;

        // arraymonedas.forEach((e: any) => {
        //   let coin = {
        //     value: e.idMonedaEmpresaOdoo,
        //     viewValue: e.name
        //   };
        //   this.coins.push(coin);
        // });
       // arrayMeses.forEach((item: any) => {
         // const mes = {
            //value: String(item.mesid),
          //  viewValue: item.nombre
        //  }
        //  this.months.push(mes);
       // });




        this.queryCompositionV = this.apollo.query({
          query: QICV,
          variables: {


            idusuario: this.userData_aux?.idUsuario,
            companiaid:this.userData_aux?.companiaId,
            categoriacompaniaid:menuCT.categoriacompaniaid,
            tableroid:menuCT.idtablero,
            anio: filtro.anioActual,
            mes: filtro.mesActual
      //      monedadestino:  filtro.monedaActual



          },
          fetchPolicy: "network-only"
        }).subscribe((response: any) => {
          if (response) {
            this.listChartsPie = [];

            localStorage.removeItem('Titulo_isquierdo');
            const pageinf: pageinf = {
              title:response.data.composicion_ventas.tablero.nombreTablero
            }
            //alert(JSON.stringify(pageinf));
            localStorage.setItem('Titulo_isquierdo', JSON.stringify(pageinf));
  
            (<HTMLHeadingElement>document.getElementById("tit")).innerHTML = response.data.composicion_ventas.tablero.nombreTablero;
  

            let indicadores = response.data.composicion_ventas.lista;

            indicadores.forEach((item: any) => {
              this.listpercentagesmes = [];
              this.listpercentagesyear = [];
              let pieChartData: any[] = [];
              let pieChartDataYear: any[] = [];
              let pieChartLabels: string[] = [];
              let listames = item.lista_mes;
              if (listames == null) {
                listames = [];
              }
              let listaanual = item.lista_anual;
              if (listaanual == null) {
                listaanual = [];
              }

              listames.forEach((item: any) => {
                this.listpercentagesmes.push(Number(item.porcentajetorta.replace(",", ".")));
                pieChartLabels.push(item.nombre);
              });

              listaanual.forEach((item: any) => {
                this.listpercentagesyear.push(Number(item.porcentajetorta.replace(",", ".")));
                if (listames.length == 0) {
                  pieChartLabels.push(item.nombre);
                }

              });
              pieChartData = this.listpercentagesmes;
              console.log(pieChartData);
              pieChartDataYear = this.listpercentagesyear;

              let pieRegion = {
                name: item.indicador.nombreIndicador,
                listPie: pieChartData,
                listPieAc: pieChartDataYear,
                labels: pieChartLabels
              }
              this.listChartsPie.push(pieRegion);

            });
          }

        });
      });
    }
  }


  private initialSetup() {


    
    this.months = [];
    this.coins = [];
    let arraymonedas: any;


    for (let listac of this.userservice.responseLogin.companiaa){

      if(listac.idCompania==this.userData_aux?.companiaId){
  
        arraymonedas = listac.monedass.info_moneda;
//this.placeholderCoin = listac.monedass.descripcion_moneda.nombre;
    
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

  }



  ngOnDestroy(): void {
    this.queryCompositionV.unsubscribe();
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

  private refreshQuery() {
    const currentFiltros: DataIndicador = {
      anioActual: Number(this.selectedyear),
      mesActual: this.selectedMonth,
      monedaActual: this.selectedCoin

    }


    let menuCT: any = localStorage.getItem('menuCT');
    menuCT = JSON.parse(menuCT);
    console.log(menuCT);


    localStorage.removeItem('filtroAMM');
    localStorage.setItem('filtroAMM', JSON.stringify(currentFiltros));


    
//    localStorage.removeItem('filtroAMM');
 //   localStorage.setItem('filtroAMM', JSON.stringify(currentFiltros));
    if (this.userservice.responseLogin) {
  //    this.months = [];
   //   let arrayMeses: any = this.userservice.responseLogin.mess.info_mes;
  
      this.listChartsPie = [];
  
    //  arrayMeses.forEach((item: any) => {
     //   const mes = {
     //     value: String(item.mesid),
      //    viewValue: item.nombre
     //   }
     //   this.months.push(mes);
    //  });



    this.months = [];
//this.barChartLabels = [];
      this.coins = [];

      let arraymonedas: any;



  
      for (let listac of this.userservice.responseLogin.companiaa){
  
        if(listac.idCompania==this.userData_aux?.companiaId){
    
          arraymonedas = listac.monedass.info_moneda;
       //   this.placeholderCoin = listac.monedass.descripcion_moneda.nombre;
      
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
  









      this.queryCompositionV = this.apollo.query({
        query: QICV,
        variables: {

          idusuario: this.userData_aux?.idUsuario,
          companiaid:this.userData_aux?.companiaId,
          categoriacompaniaid:menuCT.categoriacompaniaid,
          tableroid:menuCT.idtablero,
          anio: Number(this.selectedyear),
          mes: this.selectedMonth

        },
        fetchPolicy: "no-cache"
      }).subscribe((response: any) => {
        console.log(response);
        if (response) {
          this.listChartsPie = [];
          let indicadores = response.data.composicion_ventas.lista;
          indicadores.forEach((item: any) => {
            this.listpercentagesmes = [];
            this.listpercentagesyear = [];
            let pieChartData: any[] = [];
            let pieChartDataYear: any[] = [];
            let pieChartLabels: string[] = [];
            let listames = item.lista_mes;
            if (listames == null) {
              listames = [];
            }
            let listaanual = item.lista_anual;
            if (listaanual == null) {
              listaanual = [];
            }
  
            listames.forEach((item: any) => {
              this.listpercentagesmes.push(Number(item.porcentajetorta.replace(",", ".")));
  
              pieChartLabels.push(item.nombre);
            });
  
            listaanual.forEach((item: any) => {
              this.listpercentagesyear.push(Number(item.porcentajetorta.replace(",", ".")));
              if (listames.length == 0) {
                pieChartLabels.push(item.nombre);
              }
  
            });
            pieChartData = this.listpercentagesmes;
  
            pieChartDataYear = this.listpercentagesyear;
  
            let pieRegion = {
              name: item.indicador.nombreIndicador,
              listPie: pieChartData,
              listPieAc: pieChartDataYear,
              labels: pieChartLabels
            }
            this.listChartsPie.push(pieRegion);
  
          });
        }
  
      });
    }
 

  }

}
