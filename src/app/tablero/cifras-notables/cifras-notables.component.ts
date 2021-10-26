import { BreakpointObserver } from '@angular/cdk/layout';
import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Apollo, QueryRef } from 'apollo-angular';
import gql from 'graphql-tag';
import { number } from 'ngx-custom-validators/src/app/number/validator';
import { GlobalConstants } from 'src/app/GLOBALS/GlobalConstants';
import { AuthServiceService } from 'src/app/services/auth-service.service';
import { UserService } from '../../services/user.service';

import { Routes } from '@angular/router';
import { DataIndicador } from 'src/app/models/dataIndicador.interface';
import { GraphqlServiceService } from 'src/app/services/graphql-service.service';
//Query for for ventas indicator
const QCIFRASNOTABLES = gql`
  query  detalleCifrasNotables($idusuario:Int!,$companiaid:Int!,$categoriacompaniaid:Int!,$tableroid:Int!,$anio:Int!,$mes:String, $monedadestino:Int!) {
    detalleCifrasNotables(idusuario:$idusuario,companiaid:$companiaid,categoriacompaniaid:$categoriacompaniaid,tableroid:$tableroid,anio:$anio,mes:$mes,monedadestino:$monedadestino){
      tablero{
        idTablero
        nombreTablero
        urlTablero
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
     fechacreacionusuario
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
       idCompania
       idEmpresa
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
  selector: 'app-cifras-notables',
  templateUrl: './cifras-notables.component.html',
  styleUrls: ['./cifras-notables.component.scss']
})

// @Route([

//     { path: '/item/:id', component: CifrasNotablesComponent }

// ])
export class CifrasNotablesComponent implements OnInit {

  listVentas: any[] = []; //indicador Ventas
  listGrossProfit: any[] = [];
  listGrossMargin: any[] = [];

  listSources: any = [];
  listTittles: String[] = [];
  sourcePrecioPromedio: any[] = [];//Indicador Precio Promedio

  private queryCN: any;
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

  placeholderYear: String = 'Year';
  placeholderMonth: String = 'Month';
  placeholderCoin: String = 'Currency';

  mes: any = "Mes";
  selectedCoin = 0;

  coins: any[] = [];
  years: any[] = GlobalConstants.years;
  months: any[] = [];
  langDefault: any = '';

  constructor(public userservice: UserService,
    private apollo: Apollo,
    private serviceAuth: AuthServiceService,
    public translate: TranslateService, private ruta: ActivatedRoute,
    private route: Router,
    private serviceGraphql: GraphqlServiceService) {


  }


  ngOnInit(): void {

    if (this.userservice.responseLogin) {
      //   alert('into login');
      this.langDefault = this.userservice.responseLogin.idioma.abreviaturaIdioma;

      // alert("es dioma actual "+ this.langDefault);
      this.translate.setDefaultLang(this.langDefault);
      this.translate.use(this.langDefault);

      this.initialConfig();
      this.selectedCoin = this.userservice.responseLogin.companiaa[0].idMonedaEmpresaOdoo;

      const currentFiltros: DataIndicador = {
        anioActual: Number(this.selectedyear),
        mesActual: this.selectedMonth,
        monedaActual: this.selectedCoin

      }
      let menuCT: any = localStorage.getItem('menuCT');
      menuCT = JSON.parse(menuCT);
      console.log(menuCT);

      localStorage.setItem('filtroAMM', JSON.stringify(currentFiltros));
      this.queryCN = this.serviceGraphql.getCifrasNotables(this.userservice.responseLogin.idUsuario, this.serviceAuth.userData?.companiaId,
        menuCT.categoriacompaniaid, menuCT.idtablero, new Date().getFullYear(), String(this.MesActual), this.userservice.responseLogin.companiaa[0].idMonedaEmpresaOdoo)
        .valueChanges.subscribe((result: any) => {
          if (result) {
            this.hideloader();
          }

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
        }).valueChanges.subscribe((result: any) => {

          this.langDefault = this.serviceAuth.userData?.language;
          //  alert("idioma cambiado " + this.langDefault);
          this.translate.setDefaultLang(this.langDefault);
          this.translate.use(this.langDefault);

          let filtro: DataIndicador | null | any = null;
          filtro = localStorage.getItem('filtroAMM');
          if (filtro) {
            filtro = JSON.parse(filtro);
          } else {
            filtro = null;
          }
          // alert(filtro.anioActual);
          /// alert(filtro.mesActual);
          //  alert(filtro.monedaActual);


          this.userservice.responseLogin = result.data.validarlogin;
          let arraymonedas = this.userservice.responseLogin.monedass.info_moneda;
          this.listCompanys = result.data.validarlogin.companiaa;
          this.selectedCoin = filtro.monedaActual;
          this.selectedyear = String(filtro.anioActual);
          this.selectedMonth = filtro.mesActual;

          GlobalConstants.months = this.userservice.responseLogin.mess.info_mes;
          this.placeholderYear = this.userservice.responseLogin.anioo.descripcion_anio.nombre;
          this.placeholderMonth = this.userservice.responseLogin.mess.descripcion_mes.nombre;
          this.placeholderCoin = this.userservice.responseLogin.monedass.descripcion_moneda.nombre;



          GlobalConstants.months.forEach((item: any) => {
            const mes = {
              value: String(item.mesid),
              viewValue: item.nombre
            }
            this.months.push(mes);
          })
          arraymonedas.forEach((e: any) => {
            let coin = {
              value: e.idMonedaEmpresaOdoo,
              viewValue: e.name
            };
            this.coins.push(coin);
          });



          this.queryCN = this.apollo.watchQuery({
            query: QCIFRASNOTABLES,
            variables: {
              idusuario: this.userservice.responseLogin.idUsuario,
              anio: filtro.anioActual,
              mes: filtro.mesActual,
              compania: this.userservice.responseLogin.companiaa[0].idCompaniaOdoo,
              monedadestino: filtro.monedaActual
            }
          }).valueChanges.subscribe((result: any) => {
            if (result) {
              this.hideloader();
            }

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
  hideloader() {

    // Setting display of spinner
    // element to none
    const spinner: any = document.getElementById('loading');
    spinner.style.display = 'none';
    spinner.style.transition = 'opacity 1s ease-out';
    spinner.style.opacity = 0;
  }
  initialConfig() {
    let arraymonedas: any = this.userservice.responseLogin.monedass.info_moneda;
    let arrayMeses: any = this.userservice.responseLogin.mess.info_mes;
    this.placeholderYear = this.userservice.responseLogin.anioo.descripcion_anio.nombre;
    this.placeholderMonth = this.userservice.responseLogin.mess.descripcion_mes.nombre;
    this.placeholderCoin = this.userservice.responseLogin.monedass.descripcion_moneda.nombre;

    arraymonedas.forEach((e: any) => {
      let coin = {
        value: e.idMonedaEmpresaOdoo,
        viewValue: e.name
      };
      this.coins.push(coin);
    });
    arrayMeses.forEach((item: any) => {
      const mes = {
        value: String(item.mesid),
        viewValue: item.nombre
      }
      this.months.push(mes);
    });
  }
  refreshQuery() {
    const currentFiltros: DataIndicador = {
      anioActual: Number(this.selectedyear),
      mesActual: this.selectedMonth,
      monedaActual: this.selectedCoin

    }
    localStorage.removeItem('filtroAMM');
    localStorage.setItem('filtroAMM', JSON.stringify(currentFiltros));

    if (this.userservice.responseLogin) {
      this.queryCN = this.apollo.watchQuery({
        query: QCIFRASNOTABLES,
        variables: {
          idusuario: this.userservice.responseLogin.idUsuario,
          anio: Number(this.selectedyear),
          mes: this.selectedMonth,
          compania: this.userservice.responseLogin.companiaa[0].idCompaniaOdoo,
          monedadestino: this.selectedCoin

        }
      });

      this.queryCN.valueChanges.subscribe((result: any) => {
        if (result) {
          this.hideloader();
        }
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
          this.queryCN = this.apollo.watchQuery({
            query: QCIFRASNOTABLES,
            variables: {
              idrol: this.userservice.responseLogin.idUsuario,
              anio: Number(this.selectedyear),
              mes: this.selectedMonth,
              compania: this.userservice.responseLogin.companiaa[0].idCompaniaOdoo,
              monedadestino: this.selectedCoin

            }
          });

          this.queryCN.valueChanges.subscribe((result: any) => {
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
