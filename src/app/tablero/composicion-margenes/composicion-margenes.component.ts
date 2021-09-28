import { Component, OnDestroy, OnInit } from '@angular/core';
import { Apollo, QueryRef } from 'apollo-angular';
import gql from 'graphql-tag';
import { GlobalConstants } from 'src/app/GLOBALS/GlobalConstants';
import { UserService } from 'src/app/services/user.service';
import { Label } from 'ng2-charts';
import * as pluginDataLabels from 'chartjs-plugin-datalabels';
import { NEVER, Subscription, Observable, forkJoin, combineLatest } from 'rxjs';
import { switchMap } from 'rxjs/operators';



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
const QIPIE = gql`
query margenbruto_region($idrol1:Int!,$anioo:Int!,$mess:String,$companiaa:Int!, $monedadestinoo:Int!) {
  margenbruto_region(idrol1:$idrol1,anioo:$anioo,mess:$mess,companiaa:$companiaa, monedadestinoo:$monedadestinoo){
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
const QIPT5 = gql`
query  margenbruto_top5($idrol1:Int!,$anioo:Int!,$mess:String,$companiaa:Int!, $monedadestinoo:Int!) {
   margenbruto_top5(idrol1:$idrol1,anioo:$anioo,mess:$mess,companiaa:$companiaa, monedadestinoo:$monedadestinoo){
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

@Component({
  selector: 'app-composicion-margenes',
  templateUrl: './composicion-margenes.component.html',
  styleUrls: ['./composicion-margenes.component.scss']
})
export class ComposicionMargenesComponent implements OnInit, OnDestroy {

  constructor(public userservice: UserService,
    private apollo: Apollo) {
    this.queryPie = new Subscription();
    this.queryTop5 = new Subscription();

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
   
  }
  public pieChartPlugins = [pluginDataLabels];
  private queryTablero: any;

  private queryPie: Subscription;
  
  private queryTop5: any;

  private queryPieYear: any;
  private queryPieYearTop5: any;

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

      this.queryTablero = this.apollo.watchQuery({
        query: MENUTABLERO,
        variables: { idrolusuario: this.userservice.responseLogin.iDRolUsuario }
      });

      this.queryTablero.valueChanges.subscribe((resulttablero: any) => {

        let pieChartDataTop5: number[] = [];
        let pieChartDataRegion: number[] = [];
        let categorias;
        let tablero;
        let pieTop5: any;
        let pieRegion: any;
        categorias = resulttablero.data.menu_Indicadores[1].categoriass;
        tablero = categorias.tableross;
        GlobalConstants.detalleTablero = tablero;
      //  this.listIndicadores = tablero.find((item: any) => item.nombreTablero == "Composición de Margenes").indicadores;
  
        this.queryPie = this.apollo.watchQuery({
          query: QIPIE,
          variables: {
            idrol1: this.userservice.responseLogin.idUsuario,
            anioo: new Date().getFullYear(),
            mess: "0" + new Date().getMonth(),
            companiaa: this.userservice.responseLogin.companiaa[0].idCompaniaOdoo,
            monedadestinoo: this.userservice.responseLogin.companiaa[0].idMonedaEmpresaOdoo
          }
        }).valueChanges.subscribe((result: any) => {
          let listpercentagesmes: any = [];
          let listpercentagesanual: any = [];
          let pieChartDataRegionyear:any=[];

          let pieChartLabels: string[] = [];
          let listames = result.data.margenbruto_region.lista_mes;
          let listaanual=result.data.margenbruto_region.lista_anual;
          
          listames.forEach((item: any) => {
            listpercentagesmes.push(Number(item.porcentajetorta.replace(",", ".")));
            pieChartLabels.push(item.nombre);
          });
          listaanual.forEach((item: any) => {
            listpercentagesanual.push(Number(item.porcentajetorta.replace(",", ".")));
          //  pieChartLabels.push(item.nombre);
          });

          pieChartDataRegion = listpercentagesmes;
          pieChartDataRegionyear = listpercentagesanual; 

          let pieRegion = {
            name: "Region",
            listPie: pieChartDataRegion,
            listPieAc: pieChartDataRegionyear,
            labels: pieChartLabels
          }
          this.listChartsPie.push(pieRegion);
        });
       





        this.queryTop5 = this.apollo.watchQuery({
          query: QIPT5,
          variables: {
            idrol1: this.userservice.responseLogin.idUsuario,
            anioo: new Date().getFullYear(),
            mess: "0" + new Date().getMonth(),
            companiaa: this.userservice.responseLogin.companiaa[0].idCompaniaOdoo,
            monedadestinoo: this.userservice.responseLogin.companiaa[0].idMonedaEmpresaOdoo
          }
        }).valueChanges.subscribe((result: any) => {
          let listpercentagesmestop5: any = [];
          let pieChartLabels: string[] = [];
          let listames = result.data.margenbruto_top5.lista_mes;
        
          listames.forEach((item: any) => {
            listpercentagesmestop5.push(Number(item.porcentajetorta.replace(",", ".")));
            pieChartLabels.push(item.nombre);
          });
         

          pieChartDataTop5 = listpercentagesmestop5;
        

          let pieRegion1 = {
            name: "Region1",
            listPie: pieChartDataTop5,
            listPieAc:[],
            labels: pieChartLabels
          }
          this.listChartsPie.push(pieRegion1);
          alert(this.listChartsPie.length);

          localStorage.setItem("listar", this.listChartsPie);
        });
       

   


        this.selectedCoin = this.userservice.responseLogin.companiaa[0].idMonedaEmpresaOdoo;
        let arraymonedas = this.userservice.responseLogin.monedass;

        arraymonedas.forEach((e: any) => {
          let coin = {
            value: e.idMonedaEmpresaOdoo,
            viewValue: e.name
          };
          this.coins.push(coin);
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
      return month;
    }
  }
  onYearChange(event: any) {

  }
  onMonthChange(event: any) {


  }
  onCoinChange(event: any) {

  }
  // events
  public chartClicked(e: any): void {
    // console.log(e);
  }

  public chartHovered(e: any): void {
    // console.log(e);
  }
  ngOnDestroy(): void {
    this.queryPie.unsubscribe();
    // this.queryTop5.unsubscribe();
  }


}