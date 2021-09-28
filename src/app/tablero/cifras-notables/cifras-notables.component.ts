import { BreakpointObserver } from '@angular/cdk/layout';
import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';

import { Apollo, QueryRef } from 'apollo-angular';
import gql from 'graphql-tag';
import { number } from 'ngx-custom-validators/src/app/number/validator';
import { GlobalConstants } from 'src/app/GLOBALS/GlobalConstants';
import { AuthServiceService } from 'src/app/services/auth-service.service';
import { IndicadoresService } from '../../services/indicadores.service';
import { UserService } from '../../services/user.service';
//Query for for ventas indicator
const QIVENTAS = gql`
query detalleCifrasNotables($idrol:Int!,$anio:Int!,$mes:String,$compania:Int!, $monedadestino:Int!) {
  detalleCifrasNotables(idrol:$idrol,anio:$anio,mes:$mes,compania:$compania, monedadestino:$monedadestino){
    tablero{
      idTablero
      nombreTablero
      
    }
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
  selector: 'app-cifras-notables',
  templateUrl: './cifras-notables.component.html',
  styleUrls: ['./cifras-notables.component.scss']
})
export class CifrasNotablesComponent implements OnInit {

  listVentas: any[] = []; //indicador Ventas
  listGrossProfit: any[] = [];
  listGrossMargin: any[] = [];

  listSources: any = [];
  listTittles: String[] = [];
  sourcePrecioPromedio: any[] = [];//Indicador Precio Promedio

  private queryVentas: any;
  private queryLogin: any;
  displayedColumns = ['mes', 'acumulado'];

  // dataSourceVentas = new MatTableDataSource<any>();
  // dataSourceGrossProfit = new MatTableDataSource<any>();
  // dataSourceGrossMargin = new MatTableDataSource<any>();

  MesActual: any = this.getCurrenlyMonth();
  listCompanys: any[] = [];
  listIndicadores: any[] = [
    this.listVentas,
    this.listGrossProfit
  ];
  selectedyear = String(new Date().getFullYear());

  Month = Number(new Date().getMonth() + 1);
  selectedMonth = String(this.getCurrenlyMonth());

  selectedCoin = 0;

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

  constructor(public indicadorservice: IndicadoresService, public userservice: UserService,
    public breakpointObserver: BreakpointObserver, private apollo: Apollo,
    private serviceAuth: AuthServiceService) {
    this.breakpointObserver.observe(['(max-width: 600px)']).subscribe(result => {
      this.displayedColumns = result.matches ?
        ['mes', 'acumulado'] :
        ['mes', 'acumulado'];
    });

  }

  
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

      this.queryVentas = this.apollo.watchQuery({
        query: QIVENTAS,
        variables: {
          idrol: this.userservice.responseLogin.idUsuario,
          anio: new Date().getFullYear(),
          mes: String(this.MesActual),
          compania: this.userservice.responseLogin.companiaa[0].idCompaniaOdoo,
          monedadestino: this.userservice.responseLogin.companiaa[0].idMonedaEmpresaOdoo
        }
      });


      this.queryVentas.valueChanges.subscribe((result: any) => {
         console.log(result);
        let listaIndicadores = [];

        if (result.data.detalleCifrasNotables.lista != null) {
          let listaCifrasNotables = result.data.detalleCifrasNotables.lista;
          for (let i: number = 0; i < listaCifrasNotables.length; i++) {

            let ventas_acumulado = {
              'mes': this.changeFormato(listaCifrasNotables[i].monto_Mes),
              'acumulado': this.changeFormato(listaCifrasNotables[i].monto_Acumulado)
            };
            let ventas_acumulado_porcentaje = {
              'mes': listaCifrasNotables[i].porcentaje_Monto_Mes + "% vs " + listaCifrasNotables[i].vs,
              'acumulado': listaCifrasNotables[i].porcentaje_Monto_Acumulado + "% vs " +
                listaCifrasNotables[i].vs

            }

            if (ventas_acumulado && ventas_acumulado_porcentaje) {
              let listaitem: any[] = [];

              listaitem.push(ventas_acumulado);
              listaitem.push(ventas_acumulado_porcentaje);

              //this.listIndicadores[i].push(ventas_acumulado);
              //this.listIndicadores[i].push(ventas_acumulado_porcentaje);
              this.listTittles.push(listaCifrasNotables[i].nombreIndicador);
              let source = new MatTableDataSource<any>(listaitem);
              this.listSources.push(source);
            }

          }





        }

      });

    }
    else {
      if (this.serviceAuth.isLoggedIn()) {
        this.queryLogin = this.apollo.watchQuery({
          query: LOGIN,
          variables: { usuario: this.serviceAuth.userData?.name, clave: this.serviceAuth.userData?.password }
        });

        this.queryLogin.valueChanges.subscribe((result: any) => {
          this.userservice.responseLogin = result.data.validarlogin;
          // GlobalConstants.listCompanys=result.data.validarlogin.companiaa;
          this.listCompanys = result.data.validarlogin.companiaa;
          // this.moneda=result.data.validarlogin.monedass[0].name;
          this.selectedCoin = this.userservice.responseLogin.companiaa[0].idMonedaEmpresaOdoo;
          let arraymonedas = this.userservice.responseLogin.monedass;

          arraymonedas.forEach((e: any) => {
            let coin = {
              value: e.idMonedaEmpresaOdoo,
              viewValue: e.name
            };
            this.coins.push(coin);
          });

          this.queryVentas = this.apollo.watchQuery({
            query: QIVENTAS,
            variables: {
              idrol: this.userservice.responseLogin.idUsuario,
              anio: new Date().getFullYear(),
              mes: String(this.MesActual),
              compania: this.userservice.responseLogin.companiaa[0].idCompaniaOdoo,
              monedadestino: this.userservice.responseLogin.companiaa[0].idMonedaEmpresaOdoo
            }
          });


          this.queryVentas.valueChanges.subscribe((result: any) => {
            let listaIndicadores = [];

            if (result.data.detalleCifrasNotables.lista != null) {
              let listaCifrasNotables = result.data.detalleCifrasNotables.lista;
              for (let i: number = 0; i < listaCifrasNotables.length; i++) {
                this.changeFormato(listaCifrasNotables[i].monto_Mes);
                this.changeFormato(listaCifrasNotables[i].monto_Acumulado);
                let ventas_acumulado = {
                  'mes': listaCifrasNotables[i].monto_Mes,
                  'acumulado': listaCifrasNotables[i].monto_Acumulado
                };
                let ventas_acumulado_porcentaje = {
                  'mes': listaCifrasNotables[i].porcentaje_Monto_Mes + "% vs " + listaCifrasNotables[i].vs,
                  'acumulado': listaCifrasNotables[i].porcentaje_Monto_Acumulado + "% vs " + listaCifrasNotables[i].vs

                }

                if (ventas_acumulado && ventas_acumulado_porcentaje) {
                  let listaitem: any[] = [];

                  listaitem.push(ventas_acumulado);
                  listaitem.push(ventas_acumulado_porcentaje);

                  //this.listIndicadores[i].push(ventas_acumulado);
                  //this.listIndicadores[i].push(ventas_acumulado_porcentaje);
                  this.listTittles.push(listaCifrasNotables[i].nombreIndicador);
                  let source = new MatTableDataSource<any>(listaitem);
                  this.listSources.push(source);
                }

              }





            }

          });
        });

      }
    }


  }
  changeFormato(value: any): String {
    let number = Number(value.replace(',', '.'));
    let formateado = new Intl.NumberFormat("es-ES").format(number);

    return formateado;
    //  let numbernavegador= number.toLocaleString();

    // le puedes pasar un código de locale específico
    // console.log("Formato en EE.UU. ---- " + number.toLocaleString("en-US"));
    // console.log("Formato de España ---- " + number.toLocaleString("es-ES"));
    // alert(number);
    //let formateado=new Intl.NumberFormat("de-DE").format(number);
    // alert(formateado);
    // let formateado_ingles=new Intl.NumberFormat().format(number);
    // alert(formateado_ingles);
    // let separador:String= ".";
    // let sepDecimal:String= ',';
    // let array=value.split(',');
    // let left=array[0];
    // let rigth=array.length > 1 ? sepDecimal + array[1] : '';
    // let formateadoleft=Number(array[0]);
    // var regx = /(\d+)(\d{3})/;
    // while (regx.test(splitLeft)) {
    // splitLeft = splitLeft.replace(regx, '$1' + this.separador + '$2');
    // }
    // return this.simbol + splitLeft +splitRight;


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

    let anio = event.value;
    this.refreshQuery();

  }
  onMonthChange(event: any) {
    let month = event.value;
    this.refreshQuery();

  }
  onCoinChange(event: any) {

    let coin = event.value;
    this.refreshQuery();
  }

  refreshQuery() {
    if (this.userservice.responseLogin) {
      this.queryVentas = this.apollo.watchQuery({
        query: QIVENTAS,
        variables: {
          idrol: this.userservice.responseLogin.idUsuario,
          anio: Number(this.selectedyear),
          mes: this.selectedMonth,
          compania: this.userservice.responseLogin.companiaa[0].idCompaniaOdoo,
          monedadestino: this.selectedCoin

        }
      });

      this.queryVentas.valueChanges.subscribe((result: any) => {

        let listaIndicadores = [];
        this.listSources = [];
        this.listTittles = [];
        if (result.data.detalleCifrasNotables.lista != null) {
          let listaCifrasNotables = result.data.detalleCifrasNotables.lista;

          for (let i: number = 0; i < listaCifrasNotables.length; i++) {

            let ventas_acumulado = {
              'mes': this.changeFormato(listaCifrasNotables[i].monto_Mes),
              'acumulado': this.changeFormato(listaCifrasNotables[i].monto_Acumulado)
            };
            let ventas_acumulado_porcentaje = {
              'mes': listaCifrasNotables[i].porcentaje_Monto_Mes + "% vs " + listaCifrasNotables[i].vs,
              'acumulado': listaCifrasNotables[i].porcentaje_Monto_Acumulado + "% vs " + listaCifrasNotables[i].vs

            }

            if (ventas_acumulado && ventas_acumulado_porcentaje) {
              let listaitem: any[] = [];

              listaitem.push(ventas_acumulado);
              listaitem.push(ventas_acumulado_porcentaje);


              this.listTittles.push(listaCifrasNotables[i].nombreIndicador);
              let source = new MatTableDataSource<any>(listaitem);

              this.listSources.push(source);
            }

          }





        }


      });
    }
    else {
      if (this.serviceAuth.isLoggedIn()) {
        this.queryLogin = this.apollo.watchQuery({
          query: LOGIN,
          variables: { usuario: this.serviceAuth.userData?.name, clave: this.serviceAuth.userData?.password }
        });

        this.queryLogin.valueChanges.subscribe((result: any) => {
          this.userservice.responseLogin = result.data.validarlogin;
          // GlobalConstants.listCompanys=result.data.validarlogin.companiaa;
          this.listCompanys = result.data.validarlogin.companiaa;
          // this.moneda=result.data.validarlogin.monedass[0].name;
          this.queryVentas = this.apollo.watchQuery({
            query: QIVENTAS,
            variables: {
              idrol: this.userservice.responseLogin.idUsuario,
              anio: Number(this.selectedyear),
              mes: this.selectedMonth,
              compania: this.userservice.responseLogin.companiaa[0].idCompaniaOdoo,
              monedadestino: this.selectedCoin

            }
          });

          this.queryVentas.valueChanges.subscribe((result: any) => {

            let listaIndicadores = [];
            this.listSources = [];
            this.listTittles = [];
            if (result.data.detalleCifrasNotables.lista != null) {
              let listaCifrasNotables = result.data.detalleCifrasNotables.lista;
              for (let i: number = 0; i < listaCifrasNotables.length; i++) {

                let ventas_acumulado = {
                  'mes': listaCifrasNotables[i].monto_Mes,
                  'acumulado': listaCifrasNotables[i].monto_Acumulado
                };
                let ventas_acumulado_porcentaje = {
                  'mes': listaCifrasNotables[i].porcentaje_Monto_Mes + "% vs " + listaCifrasNotables[i].vs,
                  'acumulado': listaCifrasNotables[i].porcentaje_Monto_Acumulado + "% vs " + listaCifrasNotables[i].vs

                }

                if (ventas_acumulado && ventas_acumulado_porcentaje) {
                  let listaitem: any[] = [];

                  listaitem.push(ventas_acumulado);
                  listaitem.push(ventas_acumulado_porcentaje);


                  this.listTittles.push(listaCifrasNotables[i].nombreIndicador);
                  let source = new MatTableDataSource<any>(listaitem);

                  this.listSources.push(source);
                }

              }





            }


          });
        });


      }
    }

  }


}
export interface Element {
  name: string;
  position: number;
}

const ELEMENT_DATA: Element[] = [
  { position: 1, name: 'Hydrogen' },
  { position: 2, name: 'Helium' }
];
