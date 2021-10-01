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


const QICM = gql`
query  composicion_margenes($idrol1:Int!,$anioo:Int!,$mess:String,$companiaa:Int!, $monedadestinoo:Int!) {
  composicion_margenes(idrol1:$idrol1,anioo:$anioo,mess:$mess,companiaa:$companiaa, monedadestinoo:$monedadestinoo){
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
      iDRolUsuario
      codIdioma
      monedass{
        idMonedaEmpresaOdoo
        name
        symbol
        rate
        estado
      }
      companiaa{
        idCompaniaOdoo
        name
        idMonedaEmpresaOdoo
        estado
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
    private apoll: Apollo, private serviceAuth: AuthServiceService) {
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
          return Number.parseFloat(value).toFixed(2);
        },
      }
    }

  }

  private queryTablero: any;

  private queryComposition: Subscription;
  private queryLogin:Subscription;


  coins: any[] = [];
  years: any[] = [
    { value: '2021', viewValue: '2021' },
    { value: '2020', viewValue: '2020' },
    { value: '2019', viewValue: '2019' },
    { value: '2018', viewValue: '2018' },
    { value: '2017', viewValue: '2017' },
    { value: '2016', viewValue: '2016' }
  ];
  months: any[] = [
    { value: '01', viewValue: 'Enero' },
    { value: '02', viewValue: 'Febrero' },
    { value: '03', viewValue: 'Marzo' },
    { value: '04', viewValue: 'Abril' },
    { value: '05', viewValue: 'Mayo' },
    { value: '06', viewValue: 'Junio' },
    { value: '07', viewValue: 'Julio' },
    { value: '08', viewValue: 'Agosto' },
    { value: '09', viewValue: 'Septiembre' },
    { value: '10', viewValue: 'Octubre' },
    { value: '11', viewValue: 'Noviembre' },
    { value: '12', viewValue: 'Marzo' }
  ];
  // Pie
  public pieChartLabels: string[] = [];
  public pieChartLabelsYear: string[] = [];
  public pieChartData: number[] = [];
  public pieChartDataYear: number[] = [];
  public pieChartType = 'pie';

  ngOnInit(): void {
    if (this.userservice.responseLogin) {
      this.selectedCoin = this.userservice.responseLogin.companiaa[0].idMonedaEmpresaOdoo;
      let arraymonedas = this.userservice.responseLogin.monedass;

      arraymonedas.forEach((e: any) => {
        let coin = {
          value: e.idMonedaEmpresaOdoo,
          viewValue: e.name
        };
        this.coins.push(coin);
      });
      this.queryComposition = this.apoll.watchQuery({
        query: QICM,
        variables: {
          idrol1: this.userservice.responseLogin.idUsuario,
          anioo: new Date().getFullYear(),
          mess: this.getCurrenlyMonth(),
          companiaa: this.userservice.responseLogin.companiaa[0].idCompaniaOdoo,
          monedadestinoo: this.userservice.responseLogin.companiaa[0].idMonedaEmpresaOdoo
        }
      }).valueChanges.subscribe((response: any) => {
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
        

      });

  
    }
    else{
      this.queryLogin = this.apoll.watchQuery({
        query: LOGIN,
        variables: { usuario: this.serviceAuth.userData?.name, clave: this.serviceAuth.userData?.password }
      }).valueChanges.subscribe((response: any) => {
        this.userservice.responseLogin = response.data.validarlogin;
        this.selectedCoin = this.userservice.responseLogin.companiaa[0].idMonedaEmpresaOdoo;
        let arraymonedas = this.userservice.responseLogin.monedass;

        arraymonedas.forEach((e: any) => {
          let coin = {
            value: e.idMonedaEmpresaOdoo,
            viewValue: e.name
          };
          this.coins.push(coin);
        });
        this.queryComposition = this.apoll.watchQuery({
          query: QICM,
          variables: {
            idrol1: this.userservice.responseLogin.idUsuario,
            anioo: new Date().getFullYear(),
            mess: this.getCurrenlyMonth(),
            companiaa: this.userservice.responseLogin.companiaa[0].idCompaniaOdoo,
            monedadestinoo: this.userservice.responseLogin.companiaa[0].idMonedaEmpresaOdoo
          }
        }).valueChanges.subscribe((response: any) => {
  
          let indicadores = response.data.composicion_margenes.lista;
           console.log(indicadores);
  
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
    this.listChartsPie=[];
    this.queryComposition=this.apoll.watchQuery({
      query: QICM,
      variables: {
        idrol1: this.userservice.responseLogin.idUsuario,
        anioo: Number(this.selectedyear),
        mess: this.selectedMonth,
        companiaa: this.userservice.responseLogin.companiaa[0].idCompaniaOdoo,
        monedadestinoo: this.selectedCoin
      }
    }).valueChanges.subscribe((response: any) => {
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