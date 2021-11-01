import { BreakpointObserver } from '@angular/cdk/layout';
import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
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
import { UserAuth } from 'src/app/models/userAuth.interface';
import { json } from 'ngx-custom-validators/src/app/json/validator';
import { pageinf } from 'src/app/models/pageinfoo';
import { AppBreadcrumbComponent } from 'src/app/layouts/full/breadcrumb/breadcrumb.component';
//Query for for ventas indicator
import {AfterViewInit} from '@angular/core';

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
      idEmpresa
     
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
     
  
     companiaa{
       idCompania
       idEmpresa
        idCompaniaOdoo
         name
       idMonedaOdoo
       imagenUrl
       estado
          monedass{
       descripcion_moneda{
         auxiliarId
         nombre
         
       }
       info_moneda{
          monedaId
       idMonedaOdoo
       name
       symbol
       rate
       estado
       }
      
       
     }
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


export class CifrasNotablesComponent implements OnInit {

 //@ViewChild('tit') tit: ElementRef;
  listVentas: any[] = []; //indicador Ventas
  listGrossProfit: any[] = [];
  listGrossMargin: any[] = [];

  listSources: any = [];
  listTittles: String[] = [];
  sourcePrecioPromedio: any[] = [];//Indicador Precio Promedio

  private queryCN: any;
  private queryLogin: any;
  displayedColumns = ['mes', 'acumulado'];

 
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
  idUsuario_aux:any|undefined|0;
  companiaId_aux:any| undefined|0;

  coins: any[] = [];
  years: any[] = GlobalConstants.years;
  months: any[] = [];
  langDefault: any = '';

  userData_aux: UserAuth | null = null;
  campo:string |undefined ="vacio";

  constructor(public userservice: UserService,
    private apollo: Apollo,
    private serviceAuth: AuthServiceService,
    public translate: TranslateService, private ruta: ActivatedRoute,
    private route: Router,
    private serviceGraphql: GraphqlServiceService) {

    this.route.routeReuseStrategy.shouldReuseRoute = () => false;

  }

 
  ngOnInit(): void {

   

    if (this.userservice.responseLogin) {
      (<HTMLHeadingElement>document.getElementById("tit")).innerHTML='';     





      this.userData_aux= this.serviceAuth.Obtener_ls_authuser();
      console.log('list cifra notables inicio'+ JSON.stringify(this.userData_aux));
      console.log('variable inicio'+ JSON.stringify(this.userData_aux?.ls_idMonedaOdoo));

      //this.langDefault = this.userservice.responseLogin.idioma.abreviaturaIdioma;
      this.langDefault = this.userData_aux?.language;
      this.translate.setDefaultLang(this.langDefault);
      this.translate.use(this.langDefault);

      this.initialConfig();
    
      
       this.selectedCoin = this.userData_aux?.ls_idMonedaOdoo;
       this.idUsuario_aux= this.userData_aux?.idUsuario;
       this.companiaId_aux= this.userData_aux?.companiaId;
     
      //  alert(this.selectedCoin);
      //  alert(this.idUsuario_aux);
      //  alert(this.companiaId_aux);
      const currentFiltros: DataIndicador = {
        anioActual: Number(this.selectedyear),
        mesActual: this.selectedMonth,
        monedaActual: this.selectedCoin
      }


      let menuCT: any = localStorage.getItem('menuCT');
      menuCT = JSON.parse(menuCT);
      console.log(menuCT);

      localStorage.setItem('filtroAMM', JSON.stringify(currentFiltros));


      this.queryCN = this.serviceGraphql.getCifrasNotables(this.idUsuario_aux,this.companiaId_aux,
        menuCT.categoriacompaniaid, menuCT.idtablero, new Date().getFullYear(), String(this.MesActual), this.selectedCoin)
        .valueChanges.subscribe((result: any) => {
          if (result) {
            this.hideloader();
          }

        

          if (result.data.detalleCifrasNotables.lista != null) {

         
            localStorage.removeItem('Titulo_isquierdo');
            const pageinf: pageinf = {
              title:result.data.detalleCifrasNotables.tablero.nombreTablero
            }
            //alert(JSON.stringify(pageinf));
            localStorage.setItem('Titulo_isquierdo', JSON.stringify(pageinf));

            (<HTMLHeadingElement>document.getElementById("tit")).innerHTML = result.data.detalleCifrasNotables.tablero.nombreTablero;

            let listaCifrasNotables = result.data.detalleCifrasNotables.lista;
            for (let i: number = 0; i < listaCifrasNotables.length; i++) {

              let ventas_acumulado = {
                'mes': this.changeFormato(listaCifrasNotables[i].monto_Mes),
                'acumulado': this.changeFormato(listaCifrasNotables[i].monto_Acumulado)
              };
              let ventas_acumulado_porcentaje = {
                'mes': this.changeFormato(listaCifrasNotables[i].porcentaje_Monto_Mes + "% vs " + listaCifrasNotables[i].vs),
                'acumulado': this.changeFormato(listaCifrasNotables[i].porcentaje_Monto_Acumulado + "% vs " + listaCifrasNotables[i].vs)

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



        this.userData_aux= null;

        this.userData_aux= this.serviceAuth.Obtener_ls_authuser();
        console.log('list cifra notables cambio idioma'+ JSON.stringify(this.userData_aux));
    

        this.selectedCoin = this.userData_aux?.ls_idMonedaOdoo;
        this.idUsuario_aux= this.userData_aux?.idUsuario;
        this.companiaId_aux= this.userData_aux?.companiaId;
        const currentFiltros: DataIndicador = {
          anioActual: Number(this.selectedyear),
          mesActual: this.selectedMonth,
          monedaActual: this.selectedCoin
        }
  
  
        let menuCT: any = localStorage.getItem('menuCT');
        menuCT = JSON.parse(menuCT);
        console.log(menuCT);
  
        localStorage.setItem('filtroAMM', JSON.stringify(currentFiltros));


        this.queryLogin = this.apollo.watchQuery({
          query: LOGIN,
          variables: { usuario: this.userData_aux?.name, clave: this.userData_aux?.password }
        }).valueChanges.subscribe((result: any) => {

       

          let menuCT: any = localStorage.getItem('menuCT');
          menuCT = JSON.parse(menuCT);
          console.log(menuCT);

          //this.langDefault = this.serviceAuth.userData?.language;
          this.langDefault = this.userData_aux?.language;
        
          this.translate.setDefaultLang(this.langDefault);
          this.translate.use(this.langDefault);

          let filtro: DataIndicador | null | any = null;
          filtro = localStorage.getItem('filtroAMM');
          if (filtro) {
            filtro = JSON.parse(filtro);
          } else {
            filtro = null;
          }
       
          let arraymonedas:any;
          let lio:any;
          this.userservice.responseLogin = result.data.validarlogin;
          
           

          for (let listac of result.data.validarlogin.companiaa){
            if(listac.idCompania==this.userData_aux?.companiaId){
            // alert(listac.idCompania)
                // GlobalConstants.listMonedas = listac.monedass.info_moneda;
           //arraymonedas = this.userservice.responseLogin.companiaa.monedass.info_moneda;
           arraymonedas = listac.monedass.info_moneda;
           lio= listac.monedass;
         //  this.placeholderCoin = this.userservice.responseLogin.monedass.descripcion_moneda.nombre;
           this.placeholderCoin = listac.monedass.descripcion_moneda.nombre;

          
           
          this.listCompanys = result.data.validarlogin.companiaa;
          this.selectedCoin = filtro.monedaActual;
          this.selectedyear = String(filtro.anioActual);
          this.selectedMonth = filtro.mesActual;

          GlobalConstants.months = this.userservice.responseLogin.mess.info_mes;
          this.placeholderYear = this.userservice.responseLogin.anioo.descripcion_anio.nombre;
          this.placeholderMonth = this.userservice.responseLogin.mess.descripcion_mes.nombre;
          this.placeholderCoin = lio.descripcion_moneda.nombre;

      


          GlobalConstants.months.forEach((item: any) => {
            const mes = {
              value: String(item.mesid),
              viewValue: item.nombre
            }
            this.months.push(mes);
          })
          arraymonedas.forEach((e: any) => {
            let coin = {
              value: e.idMonedaOdoo,
              viewValue: e.name
            };
            this.coins.push(coin);
          });



            }
       }

       


          this.queryCN = this.apollo.watchQuery({
            query: QCIFRASNOTABLES,
            variables: {

              idusuario: this.idUsuario_aux,
              companiaid:this.companiaId_aux,
              categoriacompaniaid:menuCT.categoriacompaniaid,
              tableroid:menuCT.idtablero,
              anio: filtro.anioActual,
              mes: filtro.mesActual,
              monedadestino: this.selectedCoin

            }
          }).valueChanges.subscribe((result: any) => {
            if (result) {
              this.hideloader();
            }


           
            localStorage.removeItem('Titulo_isquierdo');
            const pageinf: pageinf = {
              title:result.data.detalleCifrasNotables.tablero.nombreTablero
            }
            localStorage.setItem('Titulo_isquierdo', JSON.stringify(pageinf));
  



            if (result.data.detalleCifrasNotables.lista != null) {
              let listaCifrasNotables = result.data.detalleCifrasNotables.lista;
              for (let i: number = 0; i < listaCifrasNotables.length; i++) {
                this.changeFormato(listaCifrasNotables[i].monto_Mes);
                this.changeFormato(listaCifrasNotables[i].monto_Acumulado);
                let ventas_acumulado = {
                  'mes': this.changeFormato(listaCifrasNotables[i].monto_Mes),
                  'acumulado':this.changeFormato( listaCifrasNotables[i].monto_Acumulado)
                };
                let ventas_acumulado_porcentaje = {
                  'mes': this.changeFormato(listaCifrasNotables[i].porcentaje_Monto_Mes + "% vs " + listaCifrasNotables[i].vs),
                  'acumulado': this.changeFormato(listaCifrasNotables[i].porcentaje_Monto_Acumulado + "% vs " + listaCifrasNotables[i].vs)

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
  // changeFormato(value: any): String {
  //   let number = Number(value.replace(',', '.'));
  //   let formateado = new Intl.NumberFormat("es-ES").format(number);

  //   return formateado;
   
  // }



  changeFormato(value: any): String {
    let number = Number(value.replace(',', '.'));
   // let formateado = new Intl.NumberFormat("es-ES").format(number);

   // return formateado;
     let numbernavegador= number.toLocaleString('es-ES');

    //le puedes pasar un código de locale específico
    console.log("Formato en EE.UU. ---- " + number.toLocaleString("en-US"));
    console.log("Formato de España ---- " + number.toLocaleString("es-ES"));
   // alert(number);
    let formateado=new Intl.NumberFormat("de-DE").format(number);
   // alert(formateado);
    let formateado_ingles=new Intl.NumberFormat().format(number);
//    alert(formateado_ingles);
    let separador:String= ".";
    let sepDecimal:String= ',';
    let array=value.split(',');
    let left=array[0];
    let rigth=array.length > 1 ? sepDecimal + array[1] : '';
    let formateadoleft=Number(array[0]);
    var regx = /(\d+)(\d{3})/;
   // while (regx.test(splitLeft)) {
  //  splitLeft = splitLeft.replace(regx, '$1' + this.separador + '$2');
  //  }
   // return this.simbol + splitLeft +splitRight;

    return numbernavegador;
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

    let arraymonedas: any;

    for (let listac of this.userservice.responseLogin.companiaa){

      if(listac.idCompania==this.userData_aux?.companiaId){
    //    alert(listac.idCompania);
        

        arraymonedas = listac.monedass.info_moneda;
        this.placeholderCoin = listac.monedass.descripcion_moneda.nombre;
    

        let arrayMeses: any = this.userservice.responseLogin.mess.info_mes;
        this.placeholderYear = this.userservice.responseLogin.anioo.descripcion_anio.nombre;
        this.placeholderMonth = this.userservice.responseLogin.mess.descripcion_mes.nombre;
    
        arraymonedas.forEach((e: any) => {
          let coin = {
            value: e.idMonedaOdoo,
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
    
  

     // console.log('dd julieta ve '+JSON.stringify(arraymonedas));

      }
   }
  }
  refreshQuery() {
    const currentFiltros: DataIndicador = {
      anioActual: Number(this.selectedyear),
      mesActual: this.selectedMonth,
      monedaActual: this.selectedCoin

    }
    localStorage.removeItem('filtroAMM');
    localStorage.setItem('filtroAMM', JSON.stringify(currentFiltros));

    this.userData_aux= null;
    this.userData_aux= this.serviceAuth.Obtener_ls_authuser();
    console.log('list cifra notables refresh'+ JSON.stringify(this.userData_aux));
    console.log('variable refresh '+ JSON.stringify(this.userData_aux?.ls_idMonedaOdoo));
    
   
    this.idUsuario_aux= this.userData_aux?.idUsuario;
    this.companiaId_aux= this.userData_aux?.companiaId;
  

    let menuCT: any = localStorage.getItem('menuCT');
    menuCT = JSON.parse(menuCT);
    console.log(menuCT);


    if (this.userservice.responseLogin) {
   // alert('antes del final');

      this.queryCN = this.apollo.watchQuery({
        query: QCIFRASNOTABLES,
        variables: {
          idusuario: this.idUsuario_aux,
          companiaid:this.companiaId_aux,
          categoriacompaniaid:menuCT.categoriacompaniaid,
          tableroid:menuCT.idtablero,
          anio: Number(this.selectedyear),
          mes: this.selectedMonth,
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
              'mes': this.changeFormato(listaCifrasNotables[i].porcentaje_Monto_Mes + "% vs " + listaCifrasNotables[i].vs),
              'acumulado': this.changeFormato(listaCifrasNotables[i].porcentaje_Monto_Acumulado + "% vs " + listaCifrasNotables[i].vs)

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


  }


}
export interface Element {
  name: string;
  position: number;
}
