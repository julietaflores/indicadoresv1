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
            console.log(result);
              if( result.data.validarlogin.idUsuario > 0){
                const userAuth: UserAuth = {
                   name: result.data.validarlogin.nombreUsuario,
                   password: this.pass,
                   idRol: result.data.validarlogin.iDRolUsuario
                }
                this.authService.login(userAuth);
                //this.serviceuser.sendMessageLogin(result.data);
                this.serviceuser.responseLogin=result.data.validarlogin;
             
                GlobalConstants.listCompanys=result.data.validarlogin.companiaa;
                GlobalConstants.listMonedas=result.data.validarlogin.monedass;
                this.router.navigate(['/dashboards/Inicio']);
              }
      });
     
     
    /*  this.serviceuser.getValidarLogin(name,pass).subscribe(
        (user:any)=>{
       
          if(user.estado) {
           
            //this.serviceuser.sendMessageLogin(user);
            this.serviceuser.responseLogin=user;
            this.router.navigate(['/dashboards/dashboard1']);
            this.serviceuser.getMenuRol(this.serviceuser.responseLogin.valor.IdRolUsuario).subscribe(
              (res:any)=>{

                 this.categorias=res.valor;
                 GlobalConstants.ArrayCategorias=this.categorias;
                 this.categorias.forEach((categoria:any)=>{
                     this.tableros=categoria.categoriass.tableross;
                     this.childrem=[];
                     this.tableros.forEach(element => {
                         this.childrem.push(
                             {
                                 state:element.nombreTablero,
                                 name:element.nombreTablero,
                                 type: 'link'
                             }
                         );
                     });
                 
                      let item={
                         state: 'tablero',
                         name: categoria.categoriass.nombrecategoria,
                         type: 'sub',
                         icon: 'av_timer',
                         children: this.childrem
                      }
                      this.menuitems.push(item);

                   });
                
                   GlobalConstants.menuitems=this.menuitems;
                   this.serviceuser.sendMessageLogin(GlobalConstants.menuitems);
             
              }
            );
            
           /* this.serviceuser.getMenuRol(user.valor.idRolUsuario)
            .subscribe((e:any)=>{
               this.serviceuser.sendMessageLogin(e.valor);
               
            });
          }

         
         
        }
          
      );*/
  
    }
   
  }
  thisngOnDestroy(){
    this.query.unsubscribe();
  }
 
}
