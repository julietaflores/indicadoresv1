import { Component, OnDestroy, OnInit } from '@angular/core';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import { GlobalConstants } from 'src/app/GLOBALS/GlobalConstants';
import { UserService } from 'src/app/services/user.service';
import { Label } from 'ng2-charts';
import * as pluginDataLabels from 'chartjs-plugin-datalabels';
import { NEVER, Subscription, Observable, forkJoin, combineLatest } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { AuthServiceService } from 'src/app/services/auth-service.service';
import { TranslateService } from '@ngx-translate/core';
import { DataIndicador } from 'src/app/models/dataIndicador.interface';
import { Router } from '@angular/router';
import { UserAuth } from 'src/app/models/userAuth.interface';
import { pageinf } from 'src/app/models/pageinfoo';
import { AccordionLinkDirective } from 'src/app/shared/accordion';


const QICM = gql`
query  composicion_margenes($idusuario:Int!,$companiaid:Int!,$categoriacompaniaid:Int!,$tableroid:Int!,$anio:Int!,$mes:String) {
  composicion_margenes(idusuario:$idusuario,companiaid:$companiaid,categoriacompaniaid:$categoriacompaniaid,tableroid:$tableroid,anio:$anio,mes:$mes){
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
  selector: 'app-composicion-margenes',
  templateUrl: './composicion-margenes.component.html',
  styleUrls: ['./composicion-margenes.component.scss']
})
export class ComposicionMargenesComponent implements OnInit, OnDestroy {
  userData_aux: UserAuth | null = null;

  constructor(public userservice: UserService,
    private apoll: Apollo, private serviceAuth: AuthServiceService,private route: Router,
    public translateService: TranslateService) {


      this.route.routeReuseStrategy.shouldReuseRoute = () => false;
      this.queryComposition = new Subscription();
    this.queryLogin= new Subscription();
  }
  coins: any[] = [];
  
  listIndicadores: any = [];//Lista Indicadores Composicion Ventas
  listpercentagesmes: any = [];//lista porcentajes torta mensual
  listpercentagesyear: any = [];//lista porcentajes torta anual

  listChartsPie: any = [];    //lista tortas indicadores

  langDefault: any = '';

  colors: String[] = [];
  selectedyear = String(new Date().getFullYear());
  selectedMonth = String(this.getCurrenlyMonth());
  MesActual: any = this.getCurrenlyMonth();
  selectedCoin = 0;

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

  }

  private queryTablero: any;

  private queryComposition: Subscription;
  private queryLogin:Subscription;


  // coins: any[] = [];
  years: any[] = GlobalConstants.years;
  months: any[] = [];
  // labels por cada indicador mes o Acumulado
  public pieChartLabels: string[] = [];
  public pieChartLabelsYear: string[] = [];

  public pieChartData: number[] = [];
  public pieChartDataYear: number[] = [];
  public pieChartType = 'pie';

  ngOnInit(): void {
    if (this.userservice.responseLogin) {
      //setting language chose by user
      //this.langDefault = this.userservice.responseLogin.idioma.abreviaturaIdioma;
     // this.setLanguage();

      // this.selectedCoin = this.userservice.responseLogin.companiaa[0].idMonedaEmpresaOdoo;
      // let arrayMeses:any= this.userservice.responseLogin.mess.info_mes;
      // arrayMeses.forEach((item:any)=>{
      //   const mes={
      //     value:String(item.mesid),
      //     viewValue:item.nombre
      //    }
      //    this.months.push(mes);
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
      



      const currentFiltros: DataIndicador = {
        anioActual: Number(this.selectedyear),
        mesActual: this.selectedMonth,
        monedaActual: this.selectedCoin

      }
      localStorage.setItem('filtroAMM', JSON.stringify(currentFiltros));
      
      let menuCT: any = localStorage.getItem('menuCT');
      menuCT = JSON.parse(menuCT);
      console.log(menuCT);


      // let arraymonedas = this.userservice.responseLogin.monedass;

      // // arraymonedas.forEach((e: any) => {
      // //   let coin = {
      // //     value: e.idMonedaEmpresaOdoo,
      // //     viewValue: e.name
      // //   };
      // //   this.coins.push(coin);
      // // });
      this.queryComposition = this.apoll.query({
        query: QICM,
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

        localStorage.removeItem('Titulo_isquierdo');
        const pageinf: pageinf = {
          title:response.data.composicion_margenes.tablero.nombreTablero
        }
        //alert(JSON.stringify(pageinf));
        localStorage.setItem('Titulo_isquierdo', JSON.stringify(pageinf));

        (<HTMLHeadingElement>document.getElementById("tit")).innerHTML = response.data.composicion_margenes.tablero.nombreTablero;





        let indicadores = response.data.composicion_margenes.lista;
        indicadores.forEach((item: any) => {
          this.listpercentagesmes= [];
          this.listpercentagesyear= [];
          let pieChartData: any[] = [];
          let pieChartDataYear: any[] = [];
          let pieChartLabels: string[] = [];
          let listames = item.lista_mes;
          if(listames==null){
           listames=[];
          }
          let listaanual = item.lista_anual;
          if(listaanual==null){
             listaanual=[];
          }


          listames.forEach((item: any) => {
            this.listpercentagesmes.push(Number(item.porcentajetorta.replace(",", ".")));
           
            pieChartLabels.push(item.nombre);
          });
          
          listaanual.forEach((item: any) => {
            this.listpercentagesyear.push(Number(item.porcentajetorta.replace(",", ".")));
            if(listames.length==0){
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
        

      });

  
    }
    else{

      this.userData_aux = null;

      this.userData_aux = this.serviceAuth.Obtener_ls_authuser();
      console.log('list cifra notables cambio idioma' + JSON.stringify(this.userData_aux));

      let menuCT: any = localStorage.getItem('menuCT');
      menuCT = JSON.parse(menuCT);
      console.log(menuCT);



      this.queryLogin = this.apoll.watchQuery({
        query: LOGIN,
        variables: { usuario: this.serviceAuth.userData?.name, clave: this.serviceAuth.userData?.password }
      }).valueChanges.subscribe((response: any) => {
       
        // this.userservice.responseLogin = response.data.validarlogin;
          
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
      
        // let arrayMeses:any= this.userservice.responseLogin.mess.info_mes;
        // arrayMeses.forEach((item:any)=>{
        //   const mes={
        //     value:String(item.mesid),
        //     viewValue:item.nombre
        //    }
        //    this.months.push(mes);
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


       // this.selectedCoin = filtro.monedaActual;
    //    this.selectedyear = String(filtro.anioActual);
    //    this.selectedMonth = filtro.mesActual;



    //  alert(filtro.mesActual)
     // alert(filtro.mesActual)
      
   // alert(this.userData_aux?.idUsuario+' '+this.userData_aux?.companiaId+' '+menuCT.categoriacompaniaid+' '+ menuCT.idtablero+ ' '+filtro.anioActual+' '+ filtro.mesActual)


        this.queryComposition = this.apoll.watchQuery({
          query: QICM,
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
    console.log('aqui bo '+ JSON.stringify(response));
//alert('ft')
      
       //   this.langDefault = this.userData_aux?.language;
         // this.setLanguage();

          let indicadores = response.data.composicion_margenes.lista;
          
          localStorage.removeItem('Titulo_isquierdo');
          const pageinf: pageinf = {
            title: response.data.composicion_margenes.tablero.nombreTablero
          }
          //alert(JSON.stringify(pageinf));
          localStorage.setItem('Titulo_isquierdo', JSON.stringify(pageinf));

          (<HTMLHeadingElement>document.getElementById("tit")).innerHTML = response.data.composicion_margenes.tablero.nombreTablero;


          indicadores.forEach((item: any) => {
            this.listpercentagesmes= [];
            this.listpercentagesyear= [];
            let pieChartData: any[] = [];
            let pieChartDataYear: any[] = [];
            let pieChartLabels: string[] = [];
            let listames = item.lista_mes;
            if(listames==null){
             listames=[];
            }
            let listaanual = item.lista_anual;
            if(listaanual==null){
               listaanual=[];
            }
//alert('cc');
  
            listames.forEach((item: any) => {
              this.listpercentagesmes.push(Number(item.porcentajetorta.replace(",", ".")));
             
              pieChartLabels.push(item.nombre);
            });
            
            listaanual.forEach((item: any) => {
              this.listpercentagesyear.push(Number(item.porcentajetorta.replace(",", ".")));
              if(listames.length==0){
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
             
  



          // indicadores.forEach((item: any) => {
          //   this.listpercentagesmes= [];
          //   this.listpercentagesyear= [];
          //   let pieChartData: any[] = [];
          //   let pieChartDataYear: any[] = [];
          //   let pieChartLabels: string[] = [];
          //   let listames = item.lista_mes;
          //   if(listames==null){
          //    listames=[];
          //   }
          //   let listaanual = item.lista_anual;
          //   if(listaanual==null){
          //      listaanual=[];
          //   }
  
  
          //   listames.forEach((item: any) => {
          //     this.listpercentagesmes.push(Number(item.porcentajetorta.replace(",", ".")));
             
          //     pieChartLabels.push(item.nombre);
          //   });
            
          //   listaanual.forEach((item: any) => {
          //     this.listpercentagesyear.push(Number(item.porcentajetorta.replace(",", ".")));
          //     if(listames.length==0){
          //       pieChartLabels.push(item.nombre);
          //      }
          //   });
          //   pieChartData = this.listpercentagesmes;
            
          //   pieChartDataYear = this.listpercentagesyear;
  
          //   let pieRegion = {
          //     name: item.indicador.nombreIndicador,
          //     listPie: pieChartData,
          //     listPieAc: pieChartDataYear,
          //     labels: pieChartLabels
          //   }
          //   this.listIndicadores.push(pieRegion);
             
  
          });
          
  
        });
      });
    }
  }

  setLanguage(){
    this.translateService.setDefaultLang(this.langDefault);
    this.translateService.use(this.langDefault);
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
    this.queryComposition.unsubscribe();
    // this.queryTop5.unsubscribe();
  }

  private initialSetup() {

    
    this.months = [];
    this.coins = [];
    let arraymonedas: any;

    for (let listac of this.userservice.responseLogin.companiaa) {

      if (listac.idCompania == this.userData_aux?.companiaId) {

        arraymonedas = listac.monedass.info_moneda;
     //   this.placeholderCoin = listac.monedass.descripcion_moneda.nombre;

        //  this.selectedCoinTable = arraymonedas.find((e: any) => e.idMonedaOdoo ==this.userservice.responseLogin.companiaa[0].idMonedaEmpresaOdoo).name;

        let arrayMeses: any = this.userservice.responseLogin.mess.info_mes;
        //this.placeholderYear = this.userservice.responseLogin.anioo.descripcion_anio.nombre;
      ///this.placeholderMonth = this.userservice.responseLogin.mess.descripcion_mes.nombre;
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
  



  private refreshQuery(){
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

    this.listChartsPie=[];


   
//    this.coins = [];




    let arraymonedas: any;

    for (let listac of this.userservice.responseLogin.companiaa) {

      if (listac.idCompania == this.userData_aux?.companiaId) {

        arraymonedas = listac.monedass.info_moneda;
//this.placeholderCoin = listac.monedass.descripcion_moneda.nombre;

        //  this.selectedCoinTable = arraymonedas.find((e: any) => e.idMonedaOdoo ==this.userservice.responseLogin.companiaa[0].idMonedaEmpresaOdoo).name;

        let arrayMeses: any = this.userservice.responseLogin.mess.info_mes;
  //      this.placeholderYear = this.userservice.responseLogin.anioo.descripcion_anio.nombre;
   //     this.placeholderMonth = this.userservice.responseLogin.mess.descripcion_mes.nombre;

        // arraymonedas.forEach((e: any) => {
        //   let coin = {
        //     value: e.idMonedaOdoo,
        //     viewValue: e.name
        //   };
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

    this.queryComposition=this.apoll.query({
      query: QICM,
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
      if(response){


        localStorage.removeItem('Titulo_isquierdo');
        const pageinf: pageinf = {
          title: response.data.composicion_margenes.tablero.nombreTablero
        }

        localStorage.setItem('Titulo_isquierdo', JSON.stringify(pageinf));

        (<HTMLHeadingElement>document.getElementById("tit")).innerHTML = response.data.composicion_margenes.tablero.nombreTablero;




        this.listChartsPie=[];
        let indicadores = response.data.composicion_margenes.lista;
        indicadores.forEach((item: any) => {
          this.listpercentagesmes= [];
          this.listpercentagesyear= [];
          let pieChartData: any[] = [];
          let pieChartDataYear: any[] = [];
          let pieChartLabels: string[] = [];
          let listames = item.lista_mes;
          if(listames==null){
           listames=[];
          }
          let listaanual = item.lista_anual;
          if(listaanual==null){
             listaanual=[];
          }
  
          listames.forEach((item: any) => {
            this.listpercentagesmes.push(Number(item.porcentajetorta.replace(",", ".")));
           
            pieChartLabels.push(item.nombre);
          });
          
          listaanual.forEach((item: any) => {
            this.listpercentagesyear.push(Number(item.porcentajetorta.replace(",", ".")));
            if(listames.length==0){
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
        //  alert(this.listChartsPie.length);
        
       });
      }
    
    });
      
  }



}