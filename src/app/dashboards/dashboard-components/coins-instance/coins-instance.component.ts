import { Component, OnInit } from '@angular/core';
import { GlobalConstants } from 'src/app/GLOBALS/GlobalConstants';
import { Apollo, QueryRef } from 'apollo-angular';
import gql from 'graphql-tag';
import { AuthServiceService } from 'src/app/services/auth-service.service';
import { UserService } from 'src/app/services/user.service';
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
  selector: 'app-coins-instance',
  templateUrl: './coins-instance.component.html',
  styleUrls: ['./coins-instance.component.scss']
})
export class CoinsInstanceComponent implements OnInit {
  private query: any;
  listCoins:any[]=[];
  constructor( private apollo: Apollo,private serviceAuth:AuthServiceService,
    public serviceuser:UserService) {
   
   }

  ngOnInit(): void {
    this.listCoins=GlobalConstants.listMonedas;
    if(GlobalConstants.listMonedas !=undefined){
     
      this.listCoins=GlobalConstants.listMonedas;

    }
    else{
      if(this.serviceAuth.isLoggedIn()){
        this.query = this.apollo.watchQuery({
          query: LOGIN,
          variables: { usuario:this.serviceAuth.userData?.name,clave:this.serviceAuth.userData?.password }
        });
      
        this.query.valueChanges.subscribe((result:any) => {
          console.log(result.data.validarlogin.companiaa);
          this.serviceuser.responseLogin=result.data.validarlogin;
          GlobalConstants.listMonedas=result.data.validarlogin.monedass;
          this.listCoins=GlobalConstants.listMonedas;
        });
      }
 
    }

}
}
