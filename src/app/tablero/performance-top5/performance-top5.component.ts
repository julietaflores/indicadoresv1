import { Component, OnInit } from '@angular/core';
import { ChartEvent } from 'ng-chartist';
import { ChartDataSets, ChartOptions, ChartType } from 'chart.js';

import { Label, SingleDataSet } from 'ng2-charts';
import { BreakpointObserver } from '@angular/cdk/layout';
import { MatTableDataSource } from '@angular/material/table';
import { UserService } from 'src/app/services/user.service';
import { Apollo, QueryRef } from 'apollo-angular';
import gql from 'graphql-tag';
import * as pluginDataLabels from 'chartjs-plugin-datalabels';

const QIVARS = gql`
query raking_lista_mesanual($idrol1:Int!,$anioo:Int!,$mess:String,$companiaa:Int!, $monedadestinoo:Int!,
  $proidd:Int!) {
  raking_lista_mesanual(idrol1:$idrol1,anioo:$anioo,mess:$mess,companiaa:$companiaa,
     monedadestinoo:$monedadestinoo,proidd:$proidd){
      lista{
        idIndicador
        nombreIndicador
        monto_Mes
        porcentaje_Monto_Mes
        monto_Acumulado
        porcentaje_Monto_Acumulado
        vs
      }
  } 
}
`;
const QIPTMES = gql`
query performancetopmes($idrol1:Int!,$anioo:Int!,$mess:String,$companiaa:Int!, $monedadestinoo:Int!) {
  performancetopmes(idrol1:$idrol1,anioo:$anioo,mess:$mess,companiaa:$companiaa, monedadestinoo:$monedadestinoo){
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
const QIPACUMULADO = gql`
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
  selector: 'app-performance-top5',
  templateUrl: './performance-top5.component.html',
  styleUrls: ['./performance-top5.component.scss']
})
export class PerformanceTop5Component implements OnInit {
  constructor(public userservice: UserService,
    private apollo: Apollo) { }
  //queries for GraphQL
  queryMes: any;//get first list products
  queryMesVars: any;//query list for each product
  queryYear: any;
  queryYearVariacion: any;

  selectedyear = String(new Date().getFullYear());
  selectedMonth = String(this.getCurrenlyMonth());
  MesActual: any = this.getCurrenlyMonth();
  selectedCoin = 0;
  /*DataSource Month y Acumulate*/
  dataSource = new MatTableDataSource<PerformanceTopFive>();
  dataSourceVARS = new MatTableDataSource<TopVar>();
  dataSourceAc = new MatTableDataSource<PerformanceTopFive>();
  dataSourceVARSAc = new MatTableDataSource<TopVar>();

  displayedColumns: String[] = ['conta', 'producto', 'us'];
  displayedColumnsMesVars: String[] = ['p_cantidad', 'p_ventas', 'p_precio'];
  

  public barChartOptions: ChartOptions = {
    responsive: true,



    // We use these empty structures as placeholders for dynamic theming.
    scales: { xAxes: [{}], yAxes: [{}] }
  };
  public barChartLabels: Label[] = [];
  public barChartType: ChartType = 'horizontalBar';
  public barChartLegend = true;
  public barChartPlugins = [pluginDataLabels];
  // public barChartPlugins = [];

  listaitem: PerformanceTopFive[] = [];
  listItemYear: PerformanceTopFive[] = [];
  listavariacionmes: any = [];

  listIdMes: any[] = [];
  listIdPosicionYear: any[] = [];

  listamesVAR: TopVar[] = [];
  listyearVAR: TopVar[] = [];

  public barChartColors: Array<any> = [

  ];
  public barChartData: ChartDataSets[] = [];
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


  ngOnInit(): void {
    let canvas: any = <HTMLCanvasElement>document.getElementById('canvas');
    var s = getComputedStyle(canvas);
    var w = s.width;
    var h = s.height;
    canvas.width = w.split("px")[0];
    canvas.height = h.split("px")[0];


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
      //calling graph for the first Month's table
      this.queryMes = this.apollo.watchQuery({
        query: QIPTMES,
        variables: {
          idrol1: this.userservice.responseLogin.idUsuario,
          anioo: new Date().getFullYear(),
          mess: "0" + new Date().getMonth(),
          companiaa: this.userservice.responseLogin.companiaa[0].idCompaniaOdoo,
          monedadestinoo: this.userservice.responseLogin.companiaa[0].idMonedaEmpresaOdoo
        }
      });

      this.queryMes.valueChanges.subscribe((result: any) => {
        //console.log(result.data.performancetopmes['lista']);
        this.listaitem = [];
        this.listIdMes = [];
        let listBarPercentaje: any[] = [];
        if (result.data.performancetopmes['lista'] != null) {
          let listaPerformanceMes = result.data.performancetopmes.lista;
          for (let i: number = 0; i < listaPerformanceMes.length; i++) {
            let performance_producto = {
              'conta': i + 1,
              'producto': listaPerformanceMes[i].nombre,
              'us': Number(listaPerformanceMes[i].precio)
            };
            let posicion = {
              idPosicion: listaPerformanceMes[i].idPosicion,

            }
            let diff=Number(listaPerformanceMes[i].precio)-Number(listaPerformanceMes[i].importeanterior);
            listBarPercentaje.push(diff);
            this.barChartLegend=true;
            this.barChartColors.push( { backgroundColor: 'rgb(31,78,120)' });
           

            this.barChartData[0]={
              data:listBarPercentaje,
              label:'VS ' + (new Date().getFullYear()-1),

            };

            this.listaitem.push(performance_producto);
            this.listIdMes.push(posicion);

            this.barChartOptions = {
              responsive: true,
              // We use these empty structures as placeholders for dynamic theming.
              scales: { xAxes: [{}], yAxes: [{}] },
              plugins: {
                datalabels: {
                  anchor: 'end',
                  align: 'end',
                }
              }
            };

            this.barChartLabels.push(listaPerformanceMes[i].nombre);

          }
          this.dataSource = new MatTableDataSource<PerformanceTopFive>(this.listaitem);
          
          this.listIdMes.forEach(item => {
            this.listamesVAR = [];
            this.queryMesVars = this.apollo.watchQuery({
              query: QIVARS,
              variables: {
                idrol1: this.userservice.responseLogin.idUsuario,
                anioo: new Date().getFullYear(),
                mess: "0" + new Date().getMonth(),
                companiaa: this.userservice.responseLogin.companiaa[0].idCompaniaOdoo,
                monedadestinoo: this.userservice.responseLogin.companiaa[0].idMonedaEmpresaOdoo,
                proidd: item.idPosicion

              }

            });

            this.queryMesVars.valueChanges.subscribe((result: any) => {
              let listVarMes = result.data.raking_lista_mesanual.lista;

              let topvarMes = {
                p_cantidad: Number(listVarMes[0].porcentaje_Monto_Mes.replace(',', '.')),
                p_ventas: Number(listVarMes[1].porcentaje_Monto_Mes.replace(',', '.')),
                p_precio: Number(listVarMes[2].porcentaje_Monto_Mes.replace(',', '.'))

              }
              let topvarYear = {
                p_cantidad: Number(listVarMes[0].porcentaje_Monto_Acumulado.replace(',', '.')),
                p_ventas: Number(listVarMes[1].porcentaje_Monto_Acumulado.replace(',', '.')),
                p_precio: Number(listVarMes[2].porcentaje_Monto_Acumulado.replace(',', '.'))

              }
              this.listamesVAR.push(topvarMes);
              this.listyearVAR.push(topvarYear);

              // this.barChartData[0].push();
              //  public barChartData: ChartDataSets[] = [
              //    { data: [65, 59, 80, 81, 56], label: 'Series A' }
              //  ]
            });

          });
          this.dataSourceVARS = new MatTableDataSource<TopVar>(this.listamesVAR);
          this.dataSourceVARSAc = new MatTableDataSource<TopVar>(this.listyearVAR);

          // this.queryYearVariacion = this.apollo.watchQuery({
          //   query: QIPTMES,
          //   variables: {
          //     idrol1: this.userservice.responseLogin.idUsuario,
          //     anioo: Number(new Date().getFullYear()) - 1,
          //     mess: "0" + new Date().getMonth(),
          //     companiaa: this.userservice.responseLogin.companiaa[0].idCompaniaOdoo,
          //     monedadestinoo: this.userservice.responseLogin.companiaa[0].idMonedaEmpresaOdoo
          //   }
          // });

          // this.queryYearVariacion.valueChanges.subscribe((result: any) => {
          //   // console.log(result.data.performancetopmes);
          //   this.listavariacionmes = [];
          //   this.listavariacionmes = result.data.performancetopmes.lista;

          //   for (let i = 0; i < this.listaitem.length; i++) {

          //     let var_actual: any = this.listaitem[i];
          //     let var_anterior = this.listavariacionmes.find((e: any) => e.nombre == var_actual.producto);

          //     let diff = Number(var_actual?.us) - Number(var_anterior.precio);
          //     //listBarPercentaje.push(diff);

          //   }

          //   this.barChartLegend = true;
          //   this.barChartColors.push({ backgroundColor: 'rgb(31,78,120)' });


          //   this.barChartData[0] = {
          //     data: listBarPercentaje,
          //     label: 'VS ' + (new Date().getFullYear() - 1),

          //   };

          //   //     console.log(result);
          // });





        }

      });
      //query acumulate
      this.queryYear = this.apollo.watchQuery({
        query: QIPACUMULADO,
        variables: {
          idrol1: this.userservice.responseLogin.idUsuario,
          anioo: new Date().getFullYear(),
          mess: "0" + new Date().getMonth(),
          companiaa: this.userservice.responseLogin.companiaa[0].idCompaniaOdoo,
          monedadestinoo: this.userservice.responseLogin.companiaa[0].idMonedaEmpresaOdoo
        }
      });
      this.queryYear.valueChanges.subscribe((result: any) => {
       
        this.listItemYear = [];
        this.listIdPosicionYear = [];
        let listBarPercentaje: any[] = [];
        if (result.data.performancetopanual.lista != null) {
          let listaPerformanceYear = result.data.performancetopanual.lista;
          for (let i: number = 0; i < listaPerformanceYear.length; i++) {
            let performance_producto = {
              'conta': i + 1,
              'producto': listaPerformanceYear[i].nombre,
              'us': Number(listaPerformanceYear[i].precio)
            };
            let posicion = {
              idPosicion: listaPerformanceYear[i].idPosicion,

            }
            this.listItemYear.push(performance_producto);
            this.listIdPosicionYear.push(posicion);
            // this.barChartLabels.push( listaPerformanceYear[i].nombre);

          }
          this.dataSourceAc = new MatTableDataSource<PerformanceTopFive>(this.listItemYear);


        }
      });

    }

  }
  // events
  public chartClicked({ event, active }: { event: MouseEvent, active: {}[] }): void {
    console.log(event, active);
  }

  public chartHovered({ event, active }: { event: MouseEvent, active: {}[] }): void {
    console.log(event, active);
  }
  /** Gets the total cost of all transactions. */
  getTotalCost(): any {
    let value = this.listaitem.map(t => t.us).reduce((acc, value) => acc + value, 0);
    // alert(avlue);
    return value;

    //   return this.data.map(t => t['first']).reduce((acc, value) => acc + value, 0);
  }
  public randomize(): void {
    // // Only Change 3 values
    // this.barChartData= [
    //   Math.round(Math.random() * 100),
    //   59,
    //   80,
    //   (Math.random() * 100),
    //   56,
    //   (Math.random() * 100),
    //   40 ];
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

}
export interface PerformanceTopFive {
  conta: number;
  producto: string;
  us: number;
}
export interface TopVar {
  p_cantidad: any;
  p_ventas: any;
  p_precio: any;
}
