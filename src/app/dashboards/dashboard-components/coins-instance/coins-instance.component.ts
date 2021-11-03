import { Component, OnInit } from '@angular/core';
import { GlobalConstants } from 'src/app/GLOBALS/GlobalConstants';
import { Apollo, QueryRef } from 'apollo-angular';
import gql from 'graphql-tag';
import { AuthServiceService } from 'src/app/services/auth-service.service';
import { UserService } from 'src/app/services/user.service';
import { UserAuth } from 'src/app/models/userAuth.interface';
import { pageinf } from 'src/app/models/pageinfoo';
import { TranslateService } from '@ngx-translate/core';
import { GraphqlServiceService } from 'src/app/services/graphql-service.service';

@Component({
  selector: 'app-coins-instance',
  templateUrl: './coins-instance.component.html',
  styleUrls: ['./coins-instance.component.scss']
})
export class CoinsInstanceComponent implements OnInit {
  private query: any;
  listCoins: any[] = [];
  constructor(private apollo: Apollo, private serviceAuth: AuthServiceService,
    private translate: TranslateService, public serviceuser: UserService, public serviceGraphql: GraphqlServiceService) {
    
  }
  userData_aux: UserAuth | null = null;

  ngOnInit(): void {
    this.listCoins = GlobalConstants.listMonedas;
    if (GlobalConstants.listMonedas != undefined) {

      this.listCoins = GlobalConstants.listMonedas.filter((e: any) => e.estado === true);
      this.userData_aux = null;
      this.userData_aux = this.serviceAuth.Obtener_ls_authuser();
      //   console.log('lista 2 '+ JSON.stringify(this.userData_aux));
      this.translate.setDefaultLang(this.userData_aux?.language);
      this.translate.use(this.userData_aux?.language);
    }
    else {
      if (this.serviceAuth.isLoggedIn()) {
        this.userData_aux = null;
        this.userData_aux = this.serviceAuth.Obtener_ls_authuser();
        this.translate.setDefaultLang(this.userData_aux?.language);
        this.translate.use(this.userData_aux?.language);
  
        this.query = this.serviceGraphql.postLogin(this.userData_aux?.name, this.userData_aux?.password).valueChanges.subscribe((result: any) => {
          localStorage.removeItem('titulo_izquierdo');
          const pageinf: pageinf = {
            title: 'Inicio'
          }
          localStorage.setItem('titulo_izquierdo', JSON.stringify(pageinf));

          // alert('fyy');
          this.serviceuser.responseLogin = result.data.validarlogin;
          GlobalConstants.listCompanys = result.data.validarlogin.companiaa;
          GlobalConstants.months = result.data.validarlogin.mess.info_mes;


          for (let listac of GlobalConstants.listCompanys) {
            if (listac.idCompania == this.userData_aux?.companiaId) {

              GlobalConstants.listMonedas = listac.monedass.info_moneda;


            }
          }


          this.listCoins = GlobalConstants.listMonedas;
        });
      }

    }

  }
}
