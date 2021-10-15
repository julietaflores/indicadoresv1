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


const LOGIN = gql`
  query validarlogin($usuario:String,$clave:String) {
    validarlogin(usuario: $usuario, clave: $clave) {
      idUsuario
     nombreUsuario
     usuario
    passwordd
    fechacreacionusuario
    iDRolUsuario
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

const changeLANG = gql`
  mutation usuarioCA($usuario:UsuarioInput){
    usuarioCA(usuario:$usuario){
      idUsuario
      nombreUsuario
      usuario
      passwordd
      iDRolUsuario
      codIdioma
      estado
    
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

  constructor (@Inject(DOCUMENT) document: any,   private translate: TranslateService,
    public userservice: UserService,
    public authservice: AuthServiceService, private routes: Router,
    private apollo: Apollo) {


    if (this.userservice.responseLogin) {
      this.langDefault = this.userservice.responseLogin.idioma.abreviaturaIdioma;
    }
    else {


    //  alert('esta entrando a recargar')
      if (this.authservice.isLoggedIn()) {
         
       // alert(document.location.href);
        
        this.langDefault = this.authservice.userData?.language;
      } else {
       // alert('no esta logueado');
      }
    }


    translate.setDefaultLang(this.langDefault);
    this.translate.use(this.langDefault);
    this.notifications = [];

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
alert(this.userservice.responseLogin.passwordd);
alert(this.userservice.responseLogin.idUsuario);
    this.apollo.mutate({
      mutation: changeLANG,
      variables: {
        usuario: {
          idUsuario: this.userservice.responseLogin.idUsuario,
          nombreUsuario: this.userservice.responseLogin.nombreUsuario,
          usuario: this.userservice.responseLogin.usuario,
          passwordd: this.userservice.responseLogin.passwordd,
          iDRolUsuario: this.userservice.responseLogin.iDRolUsuario,
          codIdioma: codIdioma,
          estado: this.userservice.responseLogin.estado,
          tipoEstado: 'MODIFICAR'
        }
      }
    }).subscribe((result: any) => {
console.log(result);
      const userAuth1: UserAuth = {
        idUsuario:this.userservice.responseLogin.idUsuario,
        name: this.userservice.responseLogin.usuario,
        password: this.userservice.responseLogin.passwordd,
        idRol: this.userservice.responseLogin.idUsuario,
        language: this.langDefault
      }

      this.authservice.updateStoragef(userAuth1);
      


      let url:any=document.location.href;
      //let arrays1=String(url).split('#/',2);
      let arrays=String(url).split(';',2);
     // let arrays=String(arrays1[1]).split(';',2);
      let title1=arrays[0];
      this.newURL=title1;

    //  alert('cc '+title1)
      //window.location.href="https://www.bufa.es/";
      //window.location.href="http://localhost:4200/#/tablero/Performance_general_lineas";
     // this.routes.navigateByUrl("http://localhost:4200/#/tablero/Cifras_Notables");
        window.location.reload();

    });
  }
  ngOnInit() {
    if (this.userservice.responseLogin) {
      this.companySelected = this.userservice.responseLogin.companiaa[0].name;
      this.selectedLanguage = this.languages.find(e => e.code === this.userservice.responseLogin.idioma.abreviaturaIdioma);
      this.companys = this.userservice.responseLogin.companiaa;
    }
    else {
      if (this.authservice.isLoggedIn()) {
        this.query = this.apollo.watchQuery({
          query: LOGIN,
          variables: { usuario: this.authservice.userData?.name, clave: this.authservice.userData?.password }
        });

        this.query.valueChanges.subscribe((result: any) => {
          this.userservice.responseLogin = result.data.validarlogin;
          this.companys = result.data.validarlogin.companiaa;
          this.companySelected = result.data.validarlogin.companiaa[0].name;
          this.selectedLanguage = this.languages.find(e => e.code === this.authservice.userData?.language);
          this.moneda = result.data.validarlogin.monedass.info_moneda[0].name;
        });
      }

    }

  }
  logoutUser() {
    this.authservice.logout();
    this.routes.navigate(['/authentication/login']);
  }
}
