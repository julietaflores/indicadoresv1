import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {FormBuilder,FormGroup,Validators} from '@angular/forms';

import { Apollo, QueryRef } from 'apollo-angular';
import gql from 'graphql-tag';
import { UserService } from '../../services/user.service';
import { GlobalConstants } from '../../GLOBALS/GlobalConstants';
import { UserAuth } from 'src/app/models/userAuth.interface';
import { AuthServiceService } from 'src/app/services/auth-service.service';

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
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  public form: FormGroup = Object.create(null);
  categorias:any=[];
  tableros:any[]=[];  

  childrem:any[]=[];   
  private query: any;
 
  name:String="";
  pass:String="";

  constructor(private fb: FormBuilder, private router: Router,private serviceuser:UserService,
    private apollo: Apollo,private authService:AuthServiceService) { 
    /*this.serviceuser.getMessage().subscribe(e=>{
      if(e===undefined){
        return;
        console.log(e);
      }
      
    });*/
  }

  ngOnInit(): void {
   
    this.form = this.fb.group({
      uname: ['', Validators.compose([Validators.required])],
      password: ['', Validators.compose([Validators.required])]
    });
  
  }

  onSubmit(): void {
    
    if(this.form) {

      this.name=this.form.get('uname')?.value ;
      this.pass=this.form.get('password')?.value ;

      this.query = this.apollo.watchQuery({
        query: LOGIN,
        variables: { usuario:this.name,clave:this.pass }
      });
  
      this.query.valueChanges.subscribe((result:any) => {
    
              if( result.data.validarlogin.idUsuario > 0){

                const userAuth: UserAuth = {
                  idUsuario:result.data.validarlogin.idUsuario,
                   name: result.data.validarlogin.nombreUsuario,
                   password: this.pass,
                   idRol: result.data.validarlogin.iDRolUsuario,
                   language:result.data.validarlogin.idioma.abreviaturaIdioma
                }
              
                this.authService.login(userAuth);
                //this.serviceuser.sendMessageLogin(result.data);
                this.serviceuser.responseLogin=result.data.validarlogin;
             
                GlobalConstants.listCompanys=result.data.validarlogin.companiaa;
                GlobalConstants.listMonedas=result.data.validarlogin.monedass.info_moneda;
                GlobalConstants.months=result.data.validarlogin.mess.info_mes;
                this.router.navigate(['/dashboards/Inicio']);
              }
      });
     
     
 
    }
   
  }
  thisngOnDestroy(){
    this.query.unsubscribe();
  }
 
}
