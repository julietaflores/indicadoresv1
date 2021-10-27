import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { Apollo, QueryRef } from 'apollo-angular';
import gql from 'graphql-tag';
import { UserService } from '../../services/user.service';
import { GlobalConstants } from '../../GLOBALS/GlobalConstants';
import { UserAuth } from 'src/app/models/userAuth.interface';
import { AuthServiceService } from 'src/app/services/auth-service.service';
import { GraphqlServiceService } from 'src/app/services/graphql-service.service';
import { Subscription } from 'rxjs';
import { pageinf } from 'src/app/models/pageinfoo';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  public form: FormGroup = Object.create(null);

  private query: Subscription;

  name: String = "";
  pass: String = "";

  constructor(private fb: FormBuilder, private router: Router, private serviceuser: UserService,
    private apollo: Apollo, private authService: AuthServiceService, private sgraphql: GraphqlServiceService) {
   this.query=new Subscription();
  }

  ngOnInit(): void {

    this.form = this.fb.group({
      uname: ['', Validators.compose([Validators.required])],
      password: ['', Validators.compose([Validators.required])]
    });

  }

  onSubmit(): void {

    if (this.form) {

      this.name = this.form.get('uname')?.value;
      this.pass = this.form.get('password')?.value;

 
      this.sgraphql.postLogin(this.name, this.pass).valueChanges.subscribe((response: any) => {

        if (response.data.validarlogin.idUsuario > 0) {
          
          const userAuth: UserAuth = {
            idUsuario: response.data.validarlogin.idUsuario,
            name: response.data.validarlogin.nombreUsuario,
            password: this.pass,
            companiaId:response.data.validarlogin.companiaa[0].idCompania,
            ls_idCompaniaOdoo:response.data.validarlogin.companiaa[0].idCompaniaOdoo,
            ls_idMonedaEmpresaOdoo:response.data.validarlogin.companiaa[0].idMonedaEmpresaOdoo,
            language: response.data.validarlogin.idioma.abreviaturaIdioma,
            ls_estado: response.data.validarlogin.estado,
            ls_idEmpresa: response.data.validarlogin.idEmpresa
          }

          const pageinf: pageinf = {
            title:'Inicio'
          }
          localStorage.setItem('Titulo_isquierdo', JSON.stringify(pageinf));

          this.authService.login(userAuth);
          this.serviceuser.responseLogin = response.data.validarlogin;
         // console.log('lista datos responde '+ JSON.stringify(this.serviceuser.responseLogin));
          GlobalConstants.listCompanys = response.data.validarlogin.companiaa;
          GlobalConstants.listMonedas = response.data.validarlogin.monedass.info_moneda;
          GlobalConstants.months = response.data.validarlogin.mess.info_mes;
          this.router.navigate(['/dashboards/Inicio']);
        }
      });



    }

  }
  thisngOnDestroy() {
    this.query.unsubscribe();
  }

}
