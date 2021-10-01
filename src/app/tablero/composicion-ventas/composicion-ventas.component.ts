import { Component, OnDestroy, OnInit } from '@angular/core';
import { GlobalConstants } from 'src/app/GLOBALS/GlobalConstants';
import { UserService } from 'src/app/services/user.service';
import { Apollo, QueryRef } from 'apollo-angular';
import gql from 'graphql-tag';
import { Label } from 'ng2-charts';
import * as pluginDataLabels from 'chartjs-plugin-datalabels';
import { Subscription } from 'rxjs';

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
query performanceregionmes($idrol1:Int!,$anioo:Int!,$mess:String,$companiaa:Int!, $monedadestinoo:Int!) {
  performanceregionmes(idrol1:$idrol1,anioo:$anioo,mess:$mess,companiaa:$companiaa, monedadestinoo:$monedadestinoo){
    tablero{
      idTablero
      nombreTablero
      estadoTablero
      urlTablero
      idCategoria
    }
    lista{
      idPosicion
      nombre
      importeactual
      importeanterior
      porcentajetorta
    }
  } 
}
`;
const QIPT5 = gql`
query performancetopmes($idrol1:Int!,$anioo:Int!,$mess:String,$companiaa:Int!, $monedadestinoo:Int!) {
  performancetopmes(idrol1:$idrol1,anioo:$anioo,mess:$mess,companiaa:$companiaa, monedadestinoo:$monedadestinoo){
    tablero {
      idTablero
      nombreTablero
      estadoTablero
      urlTablero
      idCategoria
    }
    lista{
      idPosicion
      nombre
      precio
      importeanterior
      porcentajetorta
    }
  } 
}
`;
const QIPIEYEAR = gql`
query performanceregionanual($idrol1:Int!,$anioo:Int!,$mess:String,$companiaa:Int!, $monedadestinoo:Int!) {
  performanceregionanual(idrol1:$idrol1,anioo:$anioo,mess:$mess,companiaa:$companiaa, monedadestinoo:$monedadestinoo){
    tablero{
      idTablero
      nombreTablero
      estadoTablero
      urlTablero
      idCategoria
    }
    lista{
      idPosicion
      nombre
      importeactual
      importeanterior
      porcentajetorta
    }
  } 
}
`;
const QIPT5YEAR = gql`
query performancetopanual($idrol1:Int!,$anioo:Int!,$mess:String,$companiaa:Int!, $monedadestinoo:Int!) {
  performancetopanual(idrol1:$idrol1,anioo:$anioo,mess:$mess,companiaa:$companiaa, monedadestinoo:$monedadestinoo){
    tablero{
      idTablero
      nombreTablero
      estadoTablero
      urlTablero
      idCategoria
    }
    lista{
      idPosicion
      nombre
      precio
      importeanterior
      porcentajetorta
    }
  } 
}
`;
const QICV=gql`
query composicion_ventas($idrol1:Int!,$anioo:Int!,$mess:String,$companiaa:Int!, $monedadestinoo:Int!) {
  composicion_ventas(idrol1:$idrol1,anioo:$anioo,mess:$mess,companiaa:$companiaa, monedadestinoo:$monedadestinoo){
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
export class ComposicionVentasComponent implements OnInit, OnDestroy  {

  constructor(public userservice: UserService,
    private apollo: Apollo) { 
      this.queryCompositionV=new Subscription();
    }

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

  pieChartOptions = {
    responsive: true,
    legend: {
      position: 'top',
    },
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
  private queryTablero: any;
  
  private queryPie: any;
  private queryTop5:any;

  private queryPieYear: any;
  private queryPieYearTop5:any;
  private queryCompositionV: Subscription;
  // dataSource = new MatTableDataSource<PerformanceGL>(ELEMENT_DATA);
  // dataSourceAc = new MatTableDataSource<PerformanceGLAcumulado>(ELEMENT_DATA_AC);
  // dataSourceVARS = new MatTableDataSource<VarPerformance>(ELEMENT_VAR);
  // dataSourceVARSAc = new MatTableDataSource<VarPerformance>(ELEMENT_VAR_AC);
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
  //public pieChartData: number[] = [];
  public pieChartData: number[] = [];
  public pieChartDataYear: number[] = [];
  // public pieChartData: number[] = [78.09, 20.95, 0.93, 0.03];
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
      this.queryCompositionV=this.apollo.watchQuery({
        query: QICV,
        variables: {
          idrol1: this.userservice.responseLogin.idUsuario,
          anioo: new Date().getFullYear(),
          mess: "08",
          companiaa: this.userservice.responseLogin.companiaa[0].idCompaniaOdoo,
          monedadestinoo: this.userservice.responseLogin.companiaa[0].idMonedaEmpresaOdoo
        }
      }).valueChanges.subscribe((response: any) => {
        let indicadores = response.data.composicion_ventas.lista;

        indicadores.forEach((item: any) => {
          console.log(item);
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
  ngOnDestroy(): void {
    this.queryCompositionV.unsubscribe();
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

}
