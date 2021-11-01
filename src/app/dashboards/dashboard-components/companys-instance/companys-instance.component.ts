import { Component, OnInit } from '@angular/core';
import { GlobalConstants } from 'src/app/GLOBALS/GlobalConstants';
import { AuthServiceService } from 'src/app/services/auth-service.service';
import { Apollo, QueryRef } from 'apollo-angular';
import gql from 'graphql-tag';
import { UserService } from 'src/app/services/user.service';
import { UserAuth } from 'src/app/models/userAuth.interface';
import { pageinf } from 'src/app/models/pageinfoo';
import { TranslateService } from '@ngx-translate/core';
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
  selector: 'app-companys-instance',
  templateUrl: './companys-instance.component.html',
  styleUrls: ['./companys-instance.component.scss']
})
export class CompanysInstanceComponent implements OnInit {
  private query: any;
  listCompanys: any[] = [];
  idcm: string= "";
   idcom_select :Number=0;
  constructor(private serviceAuth: AuthServiceService, public serviceuser: UserService, public authservice: AuthServiceService,private translate: TranslateService,
    private apollo: Apollo) {

  }
  userData_aux: UserAuth | null = null;

  ngOnInit(): void {


    
    if (GlobalConstants.listCompanys != undefined) {
     
      this.userData_aux= null;
      this.userData_aux= this.serviceAuth.Obtener_ls_authuser();
   //   console.log('lista 2 '+ JSON.stringify(this.userData_aux));
     this.translate.setDefaultLang(this.userData_aux?.language);
     this.translate.use(this.userData_aux?.language);
      this.listCompanys = GlobalConstants.listCompanys;
      this.idcom_select=this.userData_aux?.companiaId;
  
    }
    else if (this.serviceAuth.isLoggedIn()) {
    
      this.userData_aux= null;
      this.userData_aux= this.serviceAuth.Obtener_ls_authuser();
   //   console.log('lista 2 '+ JSON.stringify(this.userData_aux));
   this.translate.setDefaultLang(this.userData_aux?.language);
      this.translate.use(this.userData_aux?.language);

      console.log(this.serviceAuth.userData);
      this.query = this.apollo.watchQuery({
        query: LOGIN,
        variables: { usuario: this.userData_aux?.name, clave: this.userData_aux?.password }
      });

      this.query.valueChanges.subscribe((result: any) => {

        this.serviceuser.responseLogin = result.data.validarlogin;
        GlobalConstants.listCompanys = result.data.validarlogin.companiaa;
        this.listCompanys = GlobalConstants.listCompanys;

        this.idcom_select=this.userData_aux?.companiaId;
  

      });


    }


  }



  changecompany_tabla(idCompania: any,idCompaniaOdoo:any, idMonedaOdoo:any,imagenUrl:any  ) {
    //alert('ft '+compid); 
    this.userData_aux= this.authservice.Obtener_ls_authuser();
 
  

    const userAuth1: UserAuth = {
      idUsuario:this.userData_aux?.idUsuario,
      name:  this.userData_aux?.name,
      password: this.userData_aux?.password,
      companiaId:idCompania,
      ls_idCompaniaOdoo:idCompaniaOdoo,
      ls_idMonedaOdoo:idMonedaOdoo,
      language: this.userData_aux?.language,
      ls_estado:this.userData_aux?.ls_estado,
      ls_idEmpresa:this.userData_aux?.ls_idEmpresa,
      urlcompania:imagenUrl

    }

    

      this.authservice.updateStoragef(userAuth1);
    
     localStorage.removeItem('Titulo_isquierdo');
     const pageinf: pageinf = {
       title:'Inicio'
     }
     localStorage.setItem('Titulo_isquierdo', JSON.stringify(pageinf));

      const vat= document.location.href;
      let arrays=String(vat).split('#',2);
       let title1=arrays[0];
    window.location.href=title1;
    



 }



}
