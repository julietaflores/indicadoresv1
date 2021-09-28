import { Component } from '@angular/core';
import { PerfectScrollbarConfigInterface } from 'ngx-perfect-scrollbar';
import { TranslateService } from '@ngx-translate/core';

import { Input } from '@angular/core';
import { UserService } from '../../../services/user.service';
import { AuthServiceService } from 'src/app/services/auth-service.service';
import { Router } from '@angular/router';
import { Apollo, QueryRef } from 'apollo-angular';
import gql from 'graphql-tag';
import { GlobalConstants } from 'src/app/GLOBALS/GlobalConstants';

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
  selector: 'app-vertical-header',
  templateUrl: './vertical-header.component.html',
  styleUrls: []
})

export class VerticalAppHeaderComponent {

  public config: PerfectScrollbarConfigInterface = {};
  public notifications: Object[];
  companys:any[]=[];
  @Input() companiaArray: any = [];
  @Input() codIdioma: number = 0;
  @Input() moneda: String = '';


  // This is for Notifications
  // tslint:disable-next-line - Disables all
  /* notifications: Object[] = [
     {
       round: 'round-danger',
       icon: 'ti-link',
       title: 'Launch Admin',
       subject: 'Just see the my new admin!',
       time: '9:30 AM'
     },
     {
       round: 'round-success',
       icon: 'ti-calendar',
       title: 'Event today',
       subject: 'Just a reminder that you have event',
       time: '9:10 AM'
     },
     {
       round: 'round-info',
       icon: 'ti-settings',
       title: 'Settings',
       subject: 'You can customize this template as you want',
       time: '9:08 AM'
     },
     {
       round: 'round-primary',
       icon: 'ti-user',
       title: 'Pavan kumar',
       subject: 'Just see the my admin!',
       time: '9:00 AM'
     }
   ];*/

  // This is for Mymessages
  // tslint:disable-next-line - Disables all
  mymessages: Object[] = [
    {
      useravatar: 'assets/images/users/1.jpg',
      status: 'online',
      from: 'Pavan kumar',
      subject: 'Just see the my admin!',
      time: '9:30 AM'
    },
    {
      useravatar: 'assets/images/users/2.jpg',
      status: 'busy',
      from: 'Sonu Nigam',
      subject: 'I have sung a song! See you at',
      time: '9:10 AM'
    },
    {
      useravatar: 'assets/images/users/2.jpg',
      status: 'away',
      from: 'Arijit Sinh',
      subject: 'I am a singer!',
      time: '9:08 AM'
    },
    {
      useravatar: 'assets/images/users/4.jpg',
      status: 'offline',
      from: 'Pavan kumar',
      subject: 'Just see the my admin!',
      time: '9:00 AM'
    }
  ];

  public selectedLanguage: any = {};

  public languages: any[] = [
    {
      language: 'Español',
      code: 'es',
      id: 1,
      icon: 'es'
    },
    {
      language: 'English',
      code: 'en',
      type: 'US',
      id: 2,
      icon: 'us'
    }, {
      language: 'Portuguese',
      code: 'pt',
      id: 3,
      icon: 'pt'
    }];
  /*{
    language: 'Français',
    code: 'fr',
    icon: 'fr'
  },
    {
    language: 'German',
    code: 'de',
    icon: 'de'
  }*/

  public companySelected: string = 'COMPANY';
  private query: any;
  constructor(private translate: TranslateService,
    public userservice: UserService,
    private authservice: AuthServiceService, private routes: Router,
    private apollo: Apollo) {
    translate.setDefaultLang('en');
    //userservice.getMessage().subscribe(user);
    this.notifications = [];
    //.log(this.companiaArray[0]);
    //this.companySelected=this.companiaArray[0].Name;
  }

  changeLanguage(lang: any): void {
    this.translate.use(lang.code);
    this.selectedLanguage = lang;
  }
  ngOnInit() {
    if (this.userservice.responseLogin ) {
      this.companySelected = this.userservice.responseLogin.companiaa[0].name;
      this.selectedLanguage = this.languages.find(e => e.id === this.userservice.responseLogin.codIdioma);
      this.companys=this.userservice.responseLogin.companiaa;
    }
    else{
      if(this.authservice.isLoggedIn()){
        this.query = this.apollo.watchQuery({
          query: LOGIN,
          variables: { usuario:this.authservice.userData?.name,clave:this.authservice.userData?.password }
          });
        
            this.query.valueChanges.subscribe((result:any) => {
            this.userservice.responseLogin=result.data.validarlogin;
           // GlobalConstants.listCompanys=result.data.validarlogin.companiaa;
            this.companys=result.data.validarlogin.companiaa;
             this.companySelected=result.data.validarlogin.companiaa[0].name;
             console.log(this.companySelected);
             this.selectedLanguage=this.languages.find(e => e.id === result.data.validarlogin.codIdioma);
             this.moneda=result.data.validarlogin.monedass[0].name;
            });
      }

    }

  }
  logoutUser() {
    this.authservice.logout();
    this.routes.navigate(['/authentication/login']);
  }
}
