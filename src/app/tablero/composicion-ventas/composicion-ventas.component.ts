import { Component, OnInit } from '@angular/core';
import { GlobalConstants } from 'src/app/GLOBALS/GlobalConstants';
import { UserService } from 'src/app/services/user.service';
import { Apollo, QueryRef } from 'apollo-angular';
import gql from 'graphql-tag';
import { Label } from 'ng2-charts';
import * as pluginDataLabels from 'chartjs-plugin-datalabels';

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

@Component({
  selector: 'app-composicion-ventas',
  templateUrl: './composicion-ventas.component.html',
  styleUrls: ['./composicion-ventas.component.scss']
})
export class ComposicionVentasComponent implements OnInit {

  constructor(public userservice: UserService,
    private apollo: Apollo) { }

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

      this.queryTablero = this.apollo.watchQuery({
        query: MENUTABLERO,
        variables: { idrolusuario: this.userservice.responseLogin.iDRolUsuario }
      });

      this.queryTablero.valueChanges.subscribe((result: any) => {
        let categorias;
        let tablero;
        categorias = result.data.menu_Indicadores[1].categoriass;
        tablero = categorias.tableross;
        GlobalConstants.detalleTablero = tablero;
        this.listIndicadores = tablero.find((item: any) => item.nombreTablero === "Composición de ventas").indicadores;

        this.queryPie = this.apollo.watchQuery({
          query: QIPIE,
          variables: {
            idrol1: this.userservice.responseLogin.idUsuario,
            anioo: new Date().getFullYear(),
            mess: "0" + new Date().getMonth(),
            companiaa: this.userservice.responseLogin.companiaa[0].idCompaniaOdoo,
            monedadestinoo: this.userservice.responseLogin.companiaa[0].idMonedaEmpresaOdoo
          }
        });
        this.queryPie.valueChanges.subscribe((result: any) => {
          let listpercentagesmes:any = [];
          let pieChartDataRegion:number[] = [];
          
          let pieChartLabels: string[] = [];
          let listames = result.data.performanceregionmes.lista;

          listames.forEach((item: any) => {
            //alert(item.porcentajetorta);
            listpercentagesmes.push(Number(item.porcentajetorta.replace(",", ".")));
            pieChartLabels.push(item.nombre);
          });
          // this.colors= ['#1976d2', '#26dad2', 'rgba(255,0,0,0.3)','rgba(196,79,244,0.3)', '#dadada','rgb(246, 45, 81)','rgb(251, 140, 0)'];
          //  this.pieChartData=this.listpercentagesmes;
           pieChartDataRegion = listpercentagesmes;

          //  let pieRegion={
          //    name:"Region",
          //    listPie:pieChartDataRegion,
          //    labels:pieChartLabels
          //  }
           //Query for month Top5
           this.queryTop5 = this.apollo.watchQuery({
            query: QIPT5,
            variables: {
              idrol1: this.userservice.responseLogin.idUsuario,
              anioo: new Date().getFullYear(),
              mess: "0" + new Date().getMonth(),
              companiaa: this.userservice.responseLogin.companiaa[0].idCompaniaOdoo,
              monedadestinoo: this.userservice.responseLogin.companiaa[0].idMonedaEmpresaOdoo
            }
          });
          this.queryTop5.valueChanges.subscribe((result: any) => {

            let listpercentagesmes:any = [];
            let pieChartDataTop5:number[] = [];
            let pieChartLabels: string[] = [];
            let listames = result.data.performancetopmes.lista;
            listames.forEach((item: any) => {
              //alert(item.porcentajetorta);
              listpercentagesmes.push(Number(item.porcentajetorta.replace(",", ".")));
              pieChartLabels.push(item.nombre);
            });
            pieChartDataTop5 = listpercentagesmes;
   
            // let pieTop5={
            //   name:"Top5",
            //   listPie:pieChartDataTop5,
            //   labels:pieChartLabels
            // }
            
          
          
            this.queryPieYear = this.apollo.watchQuery({
              query: QIPIEYEAR,
              variables: {
                idrol1: this.userservice.responseLogin.idUsuario,
                anioo: new Date().getFullYear(),
                mess: "0" + new Date().getMonth(),
                companiaa: this.userservice.responseLogin.companiaa[0].idCompaniaOdoo,
                monedadestinoo: this.userservice.responseLogin.companiaa[0].idMonedaEmpresaOdoo
              }
            });
            this.queryPieYear.valueChanges.subscribe((result: any) => {
              let listpercentagesyear:any= [];
              let listayear = result.data.performanceregionanual.lista;
              let pieChartDataRegionYear:number[] = [];
              let pieChartLabelsYear:string[] = [];
    
              listayear.forEach((item: any) => {
                listpercentagesyear.push(Number(item.porcentajetorta.replace(",", ".")));
                pieChartLabelsYear.push(item.nombre);
              });
              pieChartDataRegionYear = listpercentagesyear;
              //pieChartLabels=this.listlabel;
              let pieRegion={
                name:"Region",
                listPie:pieChartDataRegion,
                listPieAc:pieChartDataRegionYear,
                labels:pieChartLabelsYear,
                
              }
              // this.listChartsPie.push(pieTop5);
              // this.listChartsPie.push(pieRegion);
              // for (let i= 0; i <= this.listIndicadores.length; i++) {
              //   this.listChartsPie[i].nameIndicador=this.listIndicadores[i].nombreIndicador;
              // }
              //Query for month Top5
              this.queryPieYearTop5= this.apollo.watchQuery({
               query: QIPT5YEAR,
               variables: {
                 idrol1: this.userservice.responseLogin.idUsuario,
                 anioo: new Date().getFullYear(),
                 mess: "0" + new Date().getMonth(),
                 companiaa: this.userservice.responseLogin.companiaa[0].idCompaniaOdoo,
                 monedadestinoo: this.userservice.responseLogin.companiaa[0].idMonedaEmpresaOdoo
               }
             });
             this.queryPieYearTop5.valueChanges.subscribe((result: any) => {
               let listpercentagesyear:any= [];
               let listayear = result.data.performancetopanual.lista;
               let pieChartDataTop5Year:number[] = [];
              //  let pieChartLabelsYear:string[] = [];
     
               listayear.forEach((item: any) => {
                 //alert(item.porcentajetorta);
                 listpercentagesyear.push(Number(item.porcentajetorta.replace(",", ".")));
                //  pieChartLabels.push(item.nombre);
               });
               pieChartDataTop5Year = listpercentagesyear;

               let pieTop5={
                 name:"Top5",
                 listPie:pieChartDataTop5,
                 listPieAc:pieChartDataTop5Year,
                 labels:pieChartLabels
               }
               
               this.listChartsPie.push(pieTop5);
               this.listChartsPie.push(pieRegion);
    
               for (let i= 0; i <= this.listIndicadores.length; i++) {
                 
                 this.listChartsPie[i].nameIndicador=this.listIndicadores[i].nombreIndicador;
               }
              
             });
      
            });
           
          });
               
         
        
        });
      

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

}
