import { Component, OnInit } from '@angular/core';
import { ChartDataSets, ChartOptions, ChartType } from 'chart.js';
import { Label } from 'ng2-charts';
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
query composicion_ventas($idusuario:Int!,$anio:Int!,$mes:String,$compania:Int!) {
  composicion_ventas(idusuario:$idusuario,anio:$anio,mes:$mes,compania:$compania){
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
      this.queryLogin= new Subscription();
     }

  listportafoliomes: any = [];//lista porcentajes torta
  listportafolioac: any = [];//lista porcentajes torta

  listChartsPie: any = [];
  listChartsTop5: any = []; 
  // barChartPie: any = [];
  // listChartsTop5: any = []

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

  private queryPortafolio: Subscription;
  private queryLogin:Subscription;


  // coins: any[] = [];
  years: any[] = GlobalConstants.years;
  months: any[] = [];
  // Pie
  public barChartLabels: string[] = [];
  public barChartLabelsYear: string[] = [];


  public barChartData:  ChartDataSets[] = [];
  public pieChartDataYear: number[] = [];
   
  public barChartType: ChartType = 'bar';
  public barChartOptions: ChartOptions = {
    responsive: true,
  };

  public barChartLegend = true;
  public barChartPlugins = [];
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
      this.queryPortafolio = this.apollo.query({
        query: QIPORTAFOLIO,
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
          this.listportafoliomes= [];
          this.listportafolioac= [];
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
            this.listportafoliomes.push(Number(item.porcentajetorta.replace(",", ".")));
           
            pieChartLabels.push(item.nombre);
          });
          
          listaanual.forEach((item: any) => {
            this.listportafolioac.push(Number(item.porcentajetorta.replace(",", ".")));
            if(listames.length==0){
              pieChartLabels.push(item.nombre);
             }
          });
          pieChartData = this.listportafoliomes;
       
          pieChartDataYear = this.listportafolioac;

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
      this.queryLogin = this.apollo.watchQuery({
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
        this.queryPortafolio = this.apollo.watchQuery({
          query: QIPORTAFOLIO,
          variables: {
            idusuario: this.userservice.responseLogin.idUsuario,
            anio: new Date().getFullYear(),
            mes: this.getCurrenlyMonth(),
            compania: this.userservice.responseLogin.companiaa[0].idCompaniaOdoo
          },
          fetchPolicy: "no-cache"
        }).valueChanges.subscribe((response: any) => {
  
          this.langDefault = this.userservice.responseLogin.idioma.abreviaturaIdioma;

          // alert("es dioma actual "+ this.langDefault);
          this.translateService.setDefaultLang(this.langDefault);
          this.translateService.use(this.langDefault);
          let indicadores = response.data.composicion_margenes.lista;
           console.log(indicadores);
  
          indicadores.forEach((item: any) => {
            this.listportafoliomes= [];
            this.listportafolioac= [];
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
              this.listportafoliomes.push(Number(item.porcentajetorta.replace(",", ".")));
             
              pieChartLabels.push(item.nombre);
            });
            
            listaanual.forEach((item: any) => {
              this.listportafolioac.push(Number(item.porcentajetorta.replace(",", ".")));
              if(listames.length==0){
                pieChartLabels.push(item.nombre);
               }
            });
            pieChartData = this.listportafoliomes;
            
            pieChartDataYear = this.listportafolioac;
  
            let pieRegion = {
              name: item.indicador.nombreIndicador,
              listPie: pieChartData,
              listPieAc: pieChartDataYear,
              labels: pieChartLabels
            }
            this.listChartsPie.push(pieRegion);
          
  
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
  private refreshQuery(){
    const currentFiltros: DataIndicador = {
      anioActual: Number(this.selectedyear),
      mesActual: this.selectedMonth,
      monedaActual: this.selectedCoin

    }
    localStorage.removeItem('filtroAMM');
    localStorage.setItem('filtroAMM', JSON.stringify(currentFiltros));

    this.listChartsPie=[];
    this.queryPortafolio=this.apollo.query({
      query: QIPORTAFOLIO,
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
          this.listportafoliomes= [];
          this.listportafolioac= [];
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
            this.listportafoliomes.push(Number(item.porcentajetorta.replace(",", ".")));
           
            pieChartLabels.push(item.nombre);
          });
          
          listaanual.forEach((item: any) => {
            this.listportafolioac.push(Number(item.porcentajetorta.replace(",", ".")));
            if(listames.length==0){
              pieChartLabels.push(item.nombre);
             }
          });
          pieChartData = this.listportafoliomes;
          console.log(pieChartData);
          pieChartDataYear = this.listportafolioac;
  
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
