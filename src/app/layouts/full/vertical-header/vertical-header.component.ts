import { Component } from '@angular/core';
import { PerfectScrollbarConfigInterface } from 'ngx-perfect-scrollbar';
import { TranslateService } from '@ngx-translate/core';
import { UserAuth } from 'src/app/models/userAuth.interface';
import { Input } from '@angular/core';
import { UserService } from '../../../services/user.service';
import { AuthServiceService } from 'src/app/services/auth-service.service';
import { Router } from '@angular/router';
import { Apollo, QueryRef } from 'apollo-angular';
import gql from 'graphql-tag';
import { GlobalConstants } from 'src/app/GLOBALS/GlobalConstants';
import { json } from 'ngx-custom-validators/src/app/json/validator';
import {  OnInit, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { pageinf } from 'src/app/models/pageinfoo';
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


const changeLANG = gql`
  mutation usuarioCA($usuario:UsuarioInput){
    usuarioCA(usuario:$usuario){
      idUsuario
      nombreUsuario
      usuario
      passwordd
      codIdioma
      estado
      idEmpresa
      idioma{
         codigoIdioma
         abreviaturaIdioma
         detalleIdioma
       }
    }
  }
`;





@Component({
  selector: 'app-vertical-header',
  templateUrl: './vertical-header.component.html',
  styleUrls: []
})

export class VerticalAppHeaderComponent {

  public config: PerfectScrollbarConfigInterface = {};
  public notifications: Object[];
  companys: any[] = [];
  @Input() companiaArray: any = [];
  @Input() codIdioma: number = 0;
  @Input() moneda: String = '';


  public selectedLanguage: any = {};

  public languages: any[] = [
    {
      language: 'Español',
      code: 'es',
      id: 1,
      icon: 'es'
    },
    {
      language: 'Inglés',
      code: 'en',
      type: 'US',
      id: 2,
      icon: 'us'
    }, {
      language: 'Portugués',
      code: 'pt',
      id: 3,
      icon: 'pt'
    }];


  public companySelected: string = 'COMPANY';
  private query: any;
  langDefault: any = '';
  newURL:any;
  nombre: any = '';
  password: any = '';
  userData_aux: UserAuth | null = null;
  sourcef: any ='';

  constructor (@Inject(DOCUMENT) document: any,   private translate: TranslateService,
    public userservice: UserService,
    public authservice: AuthServiceService, private routes: Router,
    private apollo: Apollo) {


    this.userData_aux= this.authservice.Obtener_ls_authuser();
    console.log('list cifra notables inicio'+ JSON.stringify(this.userData_aux));
    console.log('variable inicio'+ JSON.stringify(this.userData_aux?.ls_idMonedaOdoo));
  

    if (this.userservice.responseLogin) {
  //    this.langDefault = this.userservice.responseLogin.idioma.abreviaturaIdioma;
      this.langDefault = this.userData_aux?.language;
    }
    else {


    //  alert('esta entrando a recargar')
      if (this.authservice.isLoggedIn()) {
         
       // alert(document.location.href);
        
       // this.langDefault = this.authservice.userData?.language;
        this.langDefault = this.userData_aux?.language;
      } else {
       // alert('no esta logueado');
      }
    }


    translate.setDefaultLang(this.langDefault);
    this.translate.use(this.langDefault);
    this.notifications = [];

  }



  changecompany(idCompania: any,idCompaniaOdoo:any, idMonedaOdoo:any,imagenUrl:any  ) {
    //alert('ft '+compid); 


    const userAuth1: UserAuth = {
      idUsuario:this.userData_aux?.idUsuario,
      name:  this.userData_aux?.name,
      password: this.userData_aux?.password,
      companiaId:idCompania,
      ls_idCompaniaOdoo:idCompaniaOdoo,
      ls_idMonedaOdoo:idMonedaOdoo,
      language: this.langDefault,
      ls_estado:this.userData_aux?.ls_estado,
      ls_idEmpresa:this.userData_aux?.ls_idEmpresa,
      urlcompania:imagenUrl

    }

     console.log('aqui ver '+JSON.stringify(userAuth1));

      this.authservice.updateStoragef(userAuth1);
    
    //  let url:any=document.location.href;
     // this.newURL= url;


    // document.getElementById("img1").src="image2.jpg";
     localStorage.removeItem('Titulo_isquierdo');
     const pageinf: pageinf = {
       title:'Inicio'
     }
     localStorage.setItem('Titulo_isquierdo', JSON.stringify(pageinf));

      const vat= document.location.href;
      let arrays=String(vat).split('#',2);
       let title1=arrays[0];
    window.location.href=title1;
    
    
    //  window.location.reload();



 }



  changeLanguage(lang: any): void {
    
     this.translate.use(lang.code);
     this.selectedLanguage = lang;
     this.langDefault = lang.code;
     let codIdioma = lang.id;


   

     this.updatingLanguage(codIdioma);
  }



  updatingLanguage(codIdioma: number) {
    this.mutationLang(codIdioma);
  }





  private mutationLang(codIdioma: number) {
    this.userData_aux=null;
    this.userData_aux= this.authservice.Obtener_ls_authuser();
       //  alert(this.userData_aux?.idUsuario +' '+this.userData_aux?.name+' '+this.userData_aux?.password+'' +codIdioma+' '+this.userData_aux?.ls_estado+' '+this.userData_aux?.ls_idEmpresa);
    this.apollo.mutate({
      mutation: changeLANG,
      variables: {
        usuario: {
          idUsuario: this.userData_aux?.idUsuario,
          nombreUsuario: this.userData_aux?.name,
          usuario: this.userData_aux?.name,
          passwordd: this.userData_aux?.password,
          codIdioma: codIdioma,
          estado: this.userData_aux?.ls_estado,
          idEmpresa:this.userData_aux?.ls_idEmpresa, 
          tipoEstado: 'MODIFICAR'
        }
      }
    }).subscribe((response: any) => {
   //alert('cccccc')
      const userAuth1: UserAuth = {
        idUsuario:this.userData_aux?.idUsuario,
        name:  this.userData_aux?.name,
        password: this.userData_aux?.password,
        companiaId:this.userData_aux?.companiaId,
        ls_idCompaniaOdoo:this.userData_aux?.ls_idCompaniaOdoo,
        ls_idMonedaOdoo:this.userData_aux?.ls_idMonedaOdoo,
        language: this.langDefault,
        ls_estado:this.userData_aux?.ls_estado,
        ls_idEmpresa:this.userData_aux?.ls_idEmpresa,
        urlcompania:this.userData_aux?.urlcompania

      }


     
     console.log('aqui ver cambio '+JSON.stringify(userAuth1));

      this.authservice.updateStoragef(userAuth1);
      
       


      let url:any=document.location.href;
       this.newURL= url;
        window.location.reload();

    });
  }

  ngOnInit() {
  
//  alert('drr');
    if(this.userservice.responseLogin) {

 //alert('qui 1');

      this.langDefault = this.userData_aux?.language;


    //  this.companySelected = this.userservice.responseLogin.companiaa[0].name;
     

      for (let listac of GlobalConstants.listCompanys){
       if(listac.idCompania==this.userData_aux?.companiaId){
           
          //  GlobalConstants.listMonedas = listac.monedass.info_moneda;

         

            this.companySelected = listac.name;
            this.moneda = listac.monedass.info_moneda.name;

       }
     }

     (<HTMLImageElement>document.getElementById("logocompania")).src="assets/images/compania/"+this.userData_aux?.urlcompania;

      this.companys = this.userservice.responseLogin.companiaa;
      this.selectedLanguage = this.languages.find(e => e.code === this.langDefault);
      this.translate.setDefaultLang(this.langDefault);
      this.translate.use(this.langDefault);
    }
    else {
  //  alert('aqui 2');
      if (this.authservice.isLoggedIn()) {
//alert('aqui 3');


          this.userData_aux= this.authservice.Obtener_ls_authuser();
          console.log('list cifra notables ingresoo '+ JSON.stringify(this.userData_aux));
          (<HTMLImageElement>document.getElementById("logocompania")).src="assets/images/compania/"+this.userData_aux?.urlcompania;

        this.query = this.apollo.watchQuery({
          query: LOGIN,
          variables: { usuario: this.userData_aux?.name, clave: this.userData_aux?.password }
        });

        this.query.valueChanges.subscribe((response: any) => {


          this.langDefault = this.userData_aux?.language;
          this.userservice.responseLogin = response.data.validarlogin;
          this.companys = response.data.validarlogin.companiaa;
          this.selectedLanguage = this.languages.find(e => e.code === this.langDefault);

           GlobalConstants.listCompanys=response.data.validarlogin.companiaa;

           for (let listac of GlobalConstants.listCompanys){
            if(listac.idCompania==this.userData_aux?.companiaId){
                
                 GlobalConstants.listMonedas = listac.monedass.info_moneda;

                //  this.companySelected = response.data.validarlogin.companiaa[0].name;
                //  this.moneda = response.data.validarlogin.monedass.info_moneda[0].name;
       

                 this.companySelected = listac.name;
                 this.moneda = listac.monedass.info_moneda.name;

            }
          }







          this.translate.setDefaultLang(this.langDefault);
          this.translate.use(this.langDefault);
        });
      }

    }

  }


  logoutUser() {
    this.authservice.logout();
    location.reload();
  }
}
