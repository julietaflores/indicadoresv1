import { Component, OnDestroy, OnInit } from '@angular/core';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import { GlobalConstants } from 'src/app/GLOBALS/GlobalConstants';
import { UserService } from 'src/app/services/user.service';
import { Label } from 'ng2-charts';
import * as pluginDataLabels from 'chartjs-plugin-datalabels';
import { NEVER, Subscription, Observable, forkJoin, combineLatest } from 'rxjs';
import { switchMap } from 'rxjs/operators';


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


@Component({
  selector: 'app-composicion-margenes',
  templateUrl: './composicion-margenes.component.html',
  styleUrls: ['./composicion-margenes.component.scss']
})
export class ComposicionMargenesComponent implements OnInit, OnDestroy {

  constructor(public userservice: UserService,
    private apoll: Apollo) {
    this.queryComposition = new Subscription();
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

  private queryPie: any;

  private queryTop5: any;

  private queryPieYear: any;
  private queryPieYearTop5: any;

  private queryComposition: Subscription;

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

      this.queryComposition = this.apoll.watchQuery({
        query: QICM,
        variables: {
          idrol1: this.userservice.responseLogin.idUsuario,
          anioo: new Date().getFullYear(),
          mess: "08",
          companiaa: this.userservice.responseLogin.companiaa[0].idCompaniaOdoo,
          monedadestinoo: this.userservice.responseLogin.companiaa[0].idMonedaEmpresaOdoo
        }
      }).valueChanges.subscribe((response: any) => {

        let indicadores = response.data.composicion_margenes.lista;
         console.log(indicadores);

        indicadores.forEach((item: any) => {
          let listpercentagesmes: any = [];
          let listpercentagesanual: any = [];
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
          console.log(listames);
          console.log(listaanual);


          listames.forEach((item: any) => {
            listpercentagesmes.push(Number(item.porcentajetorta.replace(",", ".")));
           
            pieChartLabels.push(item.nombre);
          });
          
          listaanual.forEach((item: any) => {
            listpercentagesanual.push(Number(item.porcentajetorta.replace(",", ".")));

          });
          pieChartData = listpercentagesmes;
          console.log(pieChartData);
          pieChartDataYear = listpercentagesanual;

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
    //this.refreshQuery();
  }
  onMonthChange(event: any) {
   // this.refreshQuery();
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
    // this.queryPie.unsubscribe();
    this.queryComposition.unsubscribe();
    // this.queryTop5.unsubscribe();
  }


}