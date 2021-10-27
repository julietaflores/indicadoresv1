import { Component, OnInit } from '@angular/core';
import { GlobalConstants } from 'src/app/GLOBALS/GlobalConstants';
import { AuthServiceService } from 'src/app/services/auth-service.service';
import { Apollo, QueryRef } from 'apollo-angular';
import gql from 'graphql-tag';
import { UserService } from 'src/app/services/user.service';
import { UserAuth } from 'src/app/models/userAuth.interface';
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
  selector: 'app-companys-instance',
  templateUrl: './companys-instance.component.html',
  styleUrls: ['./companys-instance.component.scss']
})
export class CompanysInstanceComponent implements OnInit {
  private query: any;
  listCompanys: any[] = [];
  constructor(private serviceAuth: AuthServiceService, public serviceuser: UserService,
    private apollo: Apollo) {

  }
  userData_aux: UserAuth | null = null;

  ngOnInit(): void {
    if (GlobalConstants.listCompanys != undefined) {

      this.listCompanys = GlobalConstants.listCompanys;

    }
    else if (this.serviceAuth.isLoggedIn()) {
     

      this.userData_aux= null;

      this.userData_aux= this.serviceAuth.Obtener_ls_authuser();
      console.log('lista 2 '+ JSON.stringify(this.userData_aux));
  

      console.log(this.serviceAuth.userData);
      this.query = this.apollo.watchQuery({
        query: LOGIN,
        variables: { usuario: this.userData_aux?.name, clave: this.userData_aux?.password }
      });

      this.query.valueChanges.subscribe((result: any) => {

        this.serviceuser.responseLogin = result.data.validarlogin;
        GlobalConstants.listCompanys = result.data.validarlogin.companiaa;
        this.listCompanys = GlobalConstants.listCompanys;
      });


    }


  }

}
