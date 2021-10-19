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


const QICM = gql`
query  composicion_margenes($idusuario:Int!,$anio:Int!,$mes:String,$compania:Int!) {
  composicion_margenes(idusuario:$idusuario,anio:$anio,mes:$mes,compania:$compania){
    tablero{
      idTablero
      nombreTablero
      estadoTablero
      urlTablero
      idCategoria
      
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
const MENUTABLERO = gql`
query menu_Indicadores($idrolusuario:Int!) {
  menu_Indicadores(idrolusuario: $idrolusuario){
    id_categoriaRol
    iD_categoria
    iD_rolUsuario
    categoriass{
        id_categoria
        nombrecategoria
        estadoCategoria
        idcategoriaPadre
        tableross{
          idTablero
          nombreTablero
          estadoTablero
          urlTablero
          idCategoria
          indicadores{
            idIndicador
            nombreIndicador
            estadoIndicador
            iDTablero
            
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
  selector: 'app-composicion-margenes',
  templateUrl: './composicion-margenes.component.html',
  styleUrls: ['./composicion-margenes.component.scss']
})
export class ComposicionMargenesComponent implements OnInit, OnDestroy {

  constructor(public userservice: UserService,
    private apoll: Apollo, private serviceAuth: AuthServiceService,
    public translateService: TranslateService) {
    this.queryComposition = new Subscription();
    this.queryLogin= new Subscription();
  }

  listIndicadores: any = [];//Lista Indicadores Composicion Ventas
  listpercentagesmes: any = [];//lista porcentajes torta
  listpercentagesyear: any = [];//lista porcentajes torta

  listChartsPie: any = [];
  listChartsTop5: any = []

  listlabel: string[] = [];
  listlabelyear: string[] = [];
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
  // Pie
  public pieChartLabels: string[] = [];
  public pieChartLabelsYear: string[] = [];
  public pieChartData: number[] = [];
  public pieChartDataYear: number[] = [];
  public pieChartType = 'pie';

  ngOnInit(): void {
    if (this.userservice.responseLogin) {
      this.langDefault = this.userservice.responseLogin.idioma.abreviaturaIdioma;

      // alert("es dioma actual "+ this.langDefault);
      this.translateService.setDefaultLang(this.langDefault);
      this.translateService.use(this.langDefault);
      this.selectedCoin = this.userservice.responseLogin.companiaa[0].idMonedaEmpresaOdoo;
      let arrayMeses:any= this.userservice.responseLogin.mess.info_mes;
      arrayMeses.forEach((item:any)=>{
        const mes={
          value:String(item.mesid),
          viewValue:item.nombre
         }
         this.months.push(mes);
      });
         
      const currentFiltros: DataIndicador = {
        anioActual: Number(this.selectedyear),
        mesActual: this.selectedMonth,
        monedaActual: this.selectedCoin

      }
      localStorage.setItem('filtroAMM', JSON.stringify(currentFiltros));


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
          idusuario: this.userservice.responseLogin.idUsuario,
          anio: new Date().getFullYear(),
          mes: this.getCurrenlyMonth(),
          compania: this.userservice.responseLogin.companiaa[0].idCompaniaOdoo
        },
        fetchPolicy: "no-cache"
      }).subscribe((response: any) => {
        console.log(response);
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
      this.queryLogin = this.apoll.watchQuery({
        query: LOGIN,
        variables: { usuario: this.serviceAuth.userData?.name, clave: this.serviceAuth.userData?.password }
      }).valueChanges.subscribe((response: any) => {
        this.userservice.responseLogin = response.data.validarlogin;
          
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
      
        let arrayMeses:any= this.userservice.responseLogin.mess.info_mes;
        arrayMeses.forEach((item:any)=>{
          const mes={
            value:String(item.mesid),
            viewValue:item.nombre
           }
           this.months.push(mes);
        });
        // let arraymonedas = this.userservice.responseLogin.monedass;

        // arraymonedas.forEach((e: any) => {
        //   let coin = {
        //     value: e.idMonedaEmpresaOdoo,
        //     viewValue: e.name
        //   };
        //   this.coins.push(coin);
        // });
        this.queryComposition = this.apoll.watchQuery({
          query: QICM,
          variables: {
            idusuario: this.userservice.responseLogin.idUsuario,
            anio: filtro.anioActual,
            mes: filtro.mesActual,
            compania: this.userservice.responseLogin.companiaa[0].idCompaniaOdoo
          },
          fetchPolicy: "no-cache"
        }).valueChanges.subscribe((response: any) => {
  
          this.langDefault = this.userservice.responseLogin.idioma.abreviaturaIdioma;

          // alert("es dioma actual "+ this.langDefault);
          this.translateService.setDefaultLang(this.langDefault);
          this.translateService.use(this.langDefault);
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
            this.listIndicadores.push(pieRegion);
             
  
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
    this.queryComposition.unsubscribe();
    // this.queryTop5.unsubscribe();
  }
  private refreshQuery(){
    const currentFiltros: DataIndicador = {
      anioActual: Number(this.selectedyear),
      mesActual: this.selectedMonth,
      monedaActual: this.selectedCoin

    }
    localStorage.removeItem('filtroAMM');
    localStorage.setItem('filtroAMM', JSON.stringify(currentFiltros));

    this.listChartsPie=[];
    this.queryComposition=this.apoll.query({
      query: QICM,
      variables: {
        idusuario: this.userservice.responseLogin.idUsuario,
        anio: Number(this.selectedyear),
        mes: this.selectedMonth,
        compania: this.userservice.responseLogin.companiaa[0].idCompaniaOdoo
      },
      fetchPolicy: "no-cache"
    }).subscribe((response: any) => {
      if(response){
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
      
  }



}