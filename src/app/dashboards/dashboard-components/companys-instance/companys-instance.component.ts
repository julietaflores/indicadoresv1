import { Component, OnInit } from '@angular/core';
import { GlobalConstants } from 'src/app/GLOBALS/GlobalConstants';
import { AuthServiceService } from 'src/app/services/auth-service.service';
import { Apollo, QueryRef } from 'apollo-angular';
import gql from 'graphql-tag';
import { UserService } from 'src/app/services/user.service';

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

  ngOnInit(): void {
    //console.log();
    if (GlobalConstants.listCompanys != undefined) {

      this.listCompanys = GlobalConstants.listCompanys;

    }
    else if (this.serviceAuth.isLoggedIn()) {

      console.log(this.serviceAuth.userData);
      this.query = this.apollo.watchQuery({
        query: LOGIN,
        variables: { usuario: this.serviceAuth.userData?.name, clave: this.serviceAuth.userData?.password }
      });

      this.query.valueChanges.subscribe((result: any) => {

        this.serviceuser.responseLogin = result.data.validarlogin;
        GlobalConstants.listCompanys = result.data.validarlogin.companiaa;
        this.listCompanys = GlobalConstants.listCompanys;
      });


    }


  }

}
