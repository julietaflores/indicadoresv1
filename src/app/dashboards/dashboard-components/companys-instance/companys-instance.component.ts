import { Component, OnInit } from '@angular/core';
import { GlobalConstants } from 'src/app/GLOBALS/GlobalConstants';
import { AuthServiceService } from 'src/app/services/auth-service.service';
import { Apollo, QueryRef } from 'apollo-angular';
import gql from 'graphql-tag';
import { UserService } from 'src/app/services/user.service';
import { UserAuth } from 'src/app/models/userAuth.interface';
import { pageinf } from 'src/app/models/pageinfoo';
import { TranslateService } from '@ngx-translate/core';
import { GraphqlServiceService } from 'src/app/services/graphql-service.service';

@Component({
  selector: 'app-companys-instance',
  templateUrl: './companys-instance.component.html',
  styleUrls: ['./companys-instance.component.scss']
})
export class CompanysInstanceComponent implements OnInit {
  private query: any;
  listCompanys: any[] = [];
  idcm: string = "";
  idcom_select: Number = 0;
  constructor(private serviceAuth: AuthServiceService, public serviceuser: UserService,
    public authservice: AuthServiceService, private translate: TranslateService,
    private apollo: Apollo, public serviceGraphql: GraphqlServiceService) {

  }
  userData_aux: UserAuth | null = null;

  ngOnInit(): void {

    if (GlobalConstants.listCompanys != undefined) {

      this.userData_aux = null;
      this.userData_aux = this.serviceAuth.Obtener_ls_authuser();
      //   console.log('lista 2 '+ JSON.stringify(this.userData_aux));
      this.translate.setDefaultLang(this.userData_aux?.language);
      this.translate.use(this.userData_aux?.language);
      this.listCompanys = GlobalConstants.listCompanys;
      this.idcom_select = this.userData_aux?.companiaId;

    }
    else if (this.serviceAuth.isLoggedIn()) {

      this.userData_aux = null;
      this.userData_aux = this.serviceAuth.Obtener_ls_authuser();
      //   console.log('lista 2 '+ JSON.stringify(this.userData_aux));
      this.translate.setDefaultLang(this.userData_aux?.language);
      this.translate.use(this.userData_aux?.language);

      this.query = this.serviceGraphql.postLogin(this.userData_aux?.name, this.userData_aux?.password).
        valueChanges.subscribe((result: any) => {
          this.serviceuser.responseLogin = result.data.validarlogin;
          GlobalConstants.listCompanys = result.data.validarlogin.companiaa;
          this.listCompanys = GlobalConstants.listCompanys;

          this.idcom_select = this.userData_aux?.companiaId;


        });


    }


  }



  changecompany_tabla(idCompania: any, idCompaniaOdoo: any, idMonedaOdoo: any, imagenUrl: any) {
    //alert('ft '+compid); 
    this.userData_aux = this.authservice.Obtener_ls_authuser();

    const userAuth1: UserAuth = {
      idUsuario: this.userData_aux?.idUsuario,
      name: this.userData_aux?.name,
      password: this.userData_aux?.password,
      companiaId: idCompania,
      ls_idCompaniaOdoo: idCompaniaOdoo,
      ls_idMonedaOdoo: idMonedaOdoo,
      language: this.userData_aux?.language,
      ls_estado: this.userData_aux?.ls_estado,
      ls_idEmpresa: this.userData_aux?.ls_idEmpresa,
      urlcompania: imagenUrl

    }



    this.authservice.updateStoragef(userAuth1);

    localStorage.removeItem('titulo_izquierdo');
    const pageinf: pageinf = {
      title: 'Inicio'
    }
    localStorage.setItem('titulo_izquierdo', JSON.stringify(pageinf));

    const vat = document.location.href;
    let arrays = String(vat).split('#', 2);
    let title1 = arrays[0];
    window.location.href = title1;




  }



}
