import { Component, OnInit } from '@angular/core';
import { ChartDataSets, ChartOptions, ChartType } from 'chart.js';

import { Label, SingleDataSet } from 'ng2-charts';
import { BreakpointObserver } from '@angular/cdk/layout';
import { MatTableDataSource } from '@angular/material/table';
import { UserService } from 'src/app/services/user.service';
import { Apollo, QueryRef } from 'apollo-angular';
import gql from 'graphql-tag';


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
  selector: 'app-performance-general-lineas',
  templateUrl: './performance-general-lineas.component.html',
  styleUrls: ['./performance-general-lineas.component.scss']
})
export class PerformanceGeneralLineasComponent implements OnInit {
  queryMesFirst:any;
  queryMesVars:any;
  //Combobox Year,Month,Coin
  selectedyear = String(new Date().getFullYear());
  selectedMonth = String(this.getCurrenlyMonth());
  MesActual: any = this.getCurrenlyMonth();
  selectedCoin = 0;
  dataSource = new MatTableDataSource<PerformanceGL>(ELEMENT_DATA);
  dataSourceAc = new MatTableDataSource<PerformanceGLAcumulado>(ELEMENT_DATA_AC);
  dataSourceVARS = new MatTableDataSource<VarPerformance>(ELEMENT_VAR);
  dataSourceVARSAc = new MatTableDataSource<VarPerformance>(ELEMENT_VAR_AC);
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

  public barChartOptions: ChartOptions = {
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
  public barChartLabels: Label[] = ['Cruce del Zorro', 'La Curiosa - Malbec',
   'La Viuda Descalza - Singani',  'La Curiosa - Cabernet', 'Mr. Flay - Chuflay'];
  public barChartType: ChartType = 'horizontalBar';
  public barChartLegend = true;

  public barChartPlugins = [];

  public barChartColors: Array<any> = [
    { backgroundColor: 'rgb(31,78,120)' },
    { backgroundColor: '#26dad2' }
  ];
  public barChartData:  ChartDataSets[] = [
    { data: [85, 72, 78, 75, 77, 75], label: 'Crude oil prices' }
  ];

  listaitem: PerformanceGL[] = [];
  listIdMes:any[]=[];
  listamesVAR:VarPerformance[]=[];
  
  constructor(public breakpointObserver: BreakpointObserver, public userservice: UserService,
    private apollo: Apollo) {
  
   
  }

  displayedColumns: String[] = ['linea', 'moneda'];
  displayedColumnsVars: String[] = ['p_cantidad', 'p_ventas', 'p_precio'];


 // dataSource = new MatTableDataSource<PerformanceTopFive>(this.data);


  ngOnInit(): void {
  
    let canvas: any = <HTMLCanvasElement>document.getElementById('canvas');
    var s = getComputedStyle(canvas);
    var w = s.width;
    var h = s.height;
    // canvas.width = w.split("px")[0];
    
    canvas.height = canvas.width*0.9;

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
      // this.queryMesFirst = this.apollo.watchQuery({
      //   query: QIPTMES,
      //   variables: {
      //     idrol1: this.userservice.responseLogin.idUsuario,
      //     anioo: new Date().getFullYear(),
      //     mess: "0"+new Date().getMonth(),
      //     companiaa: this.userservice.responseLogin.companiaa[0].idCompaniaOdoo,
      //     monedadestinoo: this.userservice.responseLogin.companiaa[0].idMonedaEmpresaOdoo
      //   }
      // });


      // this.queryMesFirst.valueChanges.subscribe((result: any) => {
      //   //console.log(result.data.performancetopmes['lista']);
      //  this.listaitem=[];
      //   if (result.data.performancetopmes['lista'] != null) {
      //     let listaPerformanceMes = result.data.performancetopmes['lista'];
      //     for (let i: number = 0; i < listaPerformanceMes.length; i++) {
      //       let performance_producto = {
      //         'linea': listaPerformanceMes[i].nombre,
      //         'moneda':Number(listaPerformanceMes[i].precio)
      //       };
      //       let posicion={
      //         idPosicion:listaPerformanceMes[i].idPosicion,
             
      //       }
      //       this.listaitem.push(performance_producto);
      //       this.listIdMes.push(posicion);
      //       this.barChartLabels.push( listaPerformanceMes[i].nombre);
      //     }
      //     this.dataSource = new MatTableDataSource<PerformanceGL>(this.listaitem);
      //     this.listIdMes.forEach(item=>{
      //       this.listamesVAR=[];
      //       this.queryMesVars = this.apollo.watchQuery({
      //         query: QIVARS,
      //         variables: {
      //           idrol1: this.userservice.responseLogin.idUsuario,
      //           anioo: new Date().getFullYear(),
      //           mess: "0"+new Date().getMonth(),
      //           companiaa: this.userservice.responseLogin.companiaa[0].idCompaniaOdoo,
      //           monedadestinoo: this.userservice.responseLogin.companiaa[0].idMonedaEmpresaOdoo,
      //           proidd:item. idPosicion
              
      //         }
              
      //       });

      //       this.queryMesVars.valueChanges.subscribe((result: any) => {
             
      //         let listVarMes=result.data.raking_lista_mesanual.lista;
             
      //           let topvarMes={
      //             p_cantidad:listVarMes[0].porcentaje_Monto_Mes,
      //             p_ventas:listVarMes[1].porcentaje_Monto_Mes,
      //             p_precio:listVarMes[2].porcentaje_Monto_Mes
                   
      //            }
      //            this.listamesVAR.push(topvarMes);
             
      //       });
           
      //     });
      //     this.dataSourceVARS = new MatTableDataSource<TopVar>(this.listamesVAR);
      //    console.log(this.dataSourceVARS);
          
        
          
      //   }

      // });
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
    let value = this.listaitem.map(t => t.moneda).reduce((acc, value) => acc + value, 0);
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

export interface PerformanceGL{
  linea: string;
  moneda: number;
}
export interface PerformanceGLAcumulado{
  linea: string;
  moneda: number;
}
export interface VarPerformance{
  p_cantidad:any;
  p_ventas:any;
  p_precio:any;
}

const ELEMENT_DATA: PerformanceGL[] = [
  { linea: 'Cruce del Zorro', moneda: Number('81.976') },
  { linea: 'La Curiosa - Malbec', moneda: 57.128 },
  { linea: 'La Viuda Descalza - Singani', moneda:51.318 },
  { linea: 'La Curiosa - Cabernet', moneda: 22.315 },
  { linea: 'Mr. Flay - Chuflay', moneda: 17.153},
 
];
const ELEMENT_DATA_AC: PerformanceGL[] = [
  { linea: 'Cruce del Zorro', moneda: 81.976 },
  { linea: 'La Curiosa - Malbec', moneda: 57.128 },
  { linea: 'La Viuda Descalza - Singani', moneda:51.318 },
  { linea: 'La Curiosa - Cabernet', moneda: 22.315 },
  { linea: 'Mr. Flay - Chuflay', moneda: 17.153},
 
];
const ELEMENT_VAR: VarPerformance[] = [
  {p_cantidad:Number('0.56'),p_ventas:100,p_precio:100 },
  {p_cantidad:100,p_ventas:100,p_precio:100  },
  {p_cantidad:100,p_ventas:100,p_precio:100  },
  {p_cantidad:100,p_ventas:100,p_precio:100 },
  {p_cantidad:100,p_ventas:100,p_precio:100 },
 
];
const ELEMENT_VAR_AC: VarPerformance[] = [
  {p_cantidad:100,p_ventas:100,p_precio:100 },
  {p_cantidad:100,p_ventas:100,p_precio:100  },
  {p_cantidad:100,p_ventas:100,p_precio:100  },
  {p_cantidad:100,p_ventas:100,p_precio:100 },
  {p_cantidad:100,p_ventas:100,p_precio:100 },
 
];
