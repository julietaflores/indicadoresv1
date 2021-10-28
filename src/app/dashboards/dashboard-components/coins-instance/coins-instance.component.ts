import { Component, OnInit } from '@angular/core';
import { GlobalConstants } from 'src/app/GLOBALS/GlobalConstants';
import { Apollo, QueryRef } from 'apollo-angular';
import gql from 'graphql-tag';
import { AuthServiceService } from 'src/app/services/auth-service.service';
import { UserService } from 'src/app/services/user.service';
import { UserAuth } from 'src/app/models/userAuth.interface';
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

@Component({
  selector: 'app-coins-instance',
  templateUrl: './coins-instance.component.html',
  styleUrls: ['./coins-instance.component.scss']
})
export class CoinsInstanceComponent implements OnInit {
  private query: any;
  listCoins: any[] = [];
  constructor(private apollo: Apollo, private serviceAuth: AuthServiceService,
    public serviceuser: UserService) {

  }
  userData_aux: UserAuth | null = null;

  ngOnInit(): void {
    this.listCoins = GlobalConstants.listMonedas;
    if (GlobalConstants.listMonedas != undefined) {

      this.listCoins = GlobalConstants.listMonedas.filter((e:any)=>e.estado===true);

    }
    else {
      if (this.serviceAuth.isLoggedIn()) {

      
        this.userData_aux= null;

      this.userData_aux= this.serviceAuth.Obtener_ls_authuser();
      console.log('lista 1 '+ JSON.stringify(this.userData_aux));
        this.query = this.apollo.watchQuery({
          query: LOGIN,
          variables: { usuario: this.userData_aux?.name, clave: this.userData_aux?.password }
        });

        this.query.valueChanges.subscribe((result: any) => {
          localStorage.removeItem('Titulo_isquierdo');
          const pageinf: pageinf = {
            title:'Inicio'
          }
          localStorage.setItem('Titulo_isquierdo', JSON.stringify(pageinf));

      
          this.serviceuser.responseLogin = result.data.validarlogin;
          GlobalConstants.listCompanys = result.data.validarlogin.companiaa;
          GlobalConstants.months = result.data.validarlogin.mess.info_mes;
 

          for (let listac of GlobalConstants.listCompanys){
               if(listac.idCompania==this.userData_aux?.companiaId){
                   
                    GlobalConstants.listMonedas = listac.monedass.info_moneda;


               }
          }


          this.listCoins = GlobalConstants.listMonedas;
        });
      }

    }

  }
}
