import { T } from '@angular/cdk/keycodes';
import { Injectable, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';

import { Apollo, QueryRef } from 'apollo-angular';
import gql from 'graphql-tag';
import { UserService } from '../../services/user.service';
import { AuthServiceService } from 'src/app/services/auth-service.service';
import { GlobalConstants } from 'src/app/GLOBALS/GlobalConstants';
//QUERY FOR MENUS ITEMS


export interface BadgeItem {
    type: string;
    value: string;
}
export interface Saperator {
    name: string;
    type?: string;
}
export interface SubChildren {
    state: string;
    name: string;
    type?: string;
}
export interface ChildrenItems {
    state: string;
    name: string;
    type?: string;
    child?: SubChildren[];
}

export interface Menu {
    state: string;
    name: string;
    type: string;
    icon: string;
    badge?: BadgeItem[];
    saperator?: Saperator[];
    children?: ChildrenItems[];
}


const FIRSTITEM={
    
        state: 'dashboards',
        name: 'Inicio',
        type: 'subini',
        icon: 'av_timer'
    
}
const LASTITEM={
        state: 'authentication',
        name: 'Authentication',
        type: 'sub',
        icon: 'perm_contact_calendar',
        children: [
            { state: 'login', name: 'Login', type: 'link' },
            { state: 'register', name: 'Register', type: 'link' },
            { state: 'forgot', name: 'Forgot', type: 'link' },
            { state: 'lockscreen', name: 'Lockscreen', type: 'link' },
            { state: '404', name: 'Error', type: 'link' }
        ]
    
}
const PerformanceLineas={
    state:'tablero',
    name: 'Performance',
    type: 'sub',
    icon:'perm_contact_calendar',
    children:[
        {state:'Performance_lineasGenerales',name:'Performance Lineas Generales',type:'link'}
      
    ]
}
const ContribucionPortafolio={
    state:'tablero',
    name: 'ContribucionPortafolio',
    type: 'sub',
    icon:'perm_contact_calendar',
    children:[
        {state:'Contribucion_Portafolio',name:'ContribucionPortafolio',type:'link'}
     
    ]
}

const MENUGRAPHQL= gql`
query menu_Indicadores($idusuario:Int!) {
  menu_Indicadores(idusuario: $idusuario){
    id_categoriaRol
    iD_categoria
    iD_rolUsuario
    categoriass{
        id_categoria
        nombrecategoria
        estadoCategoria
        idcategoriaPadre
        tableross{
          idTablero
          nombreTablero
          estadoTablero
          urlTablero
          idCategoria
          indicadores{
            idIndicador
            nombreIndicador
            estadoIndicador
            iDTablero
            
          }
          
        }
      }
} 
}
`;
@Injectable()
export class MenuItems{
    
   // subscription: Subscription;
    user:any;
    menuitems: any[]=[];
    categorias:any=[];         
    childrem:any[]=[];
    tableros:any[]=[];  
    private query: any;
    idUsuario:Number|undefined;
    lang:String|undefined;

    constructor(private serviceuser:UserService,private apollo: Apollo,
        private serviceAuth:AuthServiceService) {    
        this.menuitems=[];
        this.menuitems.push(FIRSTITEM);
    
        if(this.serviceuser.responseLogin){
          
    //        alert('cc44');
            this.idUsuario=this.serviceuser.responseLogin.idUsuario;
            this.lang=this.serviceuser.responseLogin.idioma.abreviaturaIdioma;
            this.query= this.apollo.watchQuery({
                query: MENUGRAPHQL,
                variables: { idusuario:this.idUsuario}
              });
          
              this.query.valueChanges.subscribe((result:any) => {
                this.categorias=result.data.menu_Indicadores;
                this.categorias.forEach((categoria:any)=>{
                    this.tableros=categoria.categoriass.tableross;
                    GlobalConstants.detalleTablero=categoria.categoriass.tableross;
                    this.childrem=[];
                    this.tableros.forEach(element => {
                        this.childrem.push(
                            {
                                state:element.urlTablero,
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
              }); 
  
        }
        else{
            if(this.serviceAuth.isLoggedIn()){
           

     //           alert('cc45');
                this.idUsuario=this.serviceAuth.userData?.idUsuario;
               // alert('idRol '+this.idUsuario);
                this.lang=this.serviceAuth.userData?.language;
               // alert('lang '+this.lang);
                this.query= this.apollo.watchQuery({
                    query: MENUGRAPHQL,
                    variables: { idusuario:this.idUsuario}
                  });
              
                  this.query.valueChanges.subscribe((result:any) => {
     
                    this.categorias=result.data.menu_Indicadores;
                    this.categorias.forEach((categoria:any)=>{
                        this.tableros=categoria.categoriass.tableross;
                        this.childrem=[];
                        this.tableros.forEach(element => {

                      //    alert('cam '+element.nombreTablero);

                            this.childrem.push(
                                {
                                    state:element.urlTablero,
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
                  }); 
      
            }
        }

     // this.menuitems.push(ContribucionPortafolio);
    }
    ngOnInit(): void {
       
    }
    
    getMenuitem(): Menu[] {
        return this.menuitems;
    }
    thisngOnDestroy(){
        this.query.unsubscribe();
      }
   /* setItems(Menu[]:menu):void {
      this.menuitems=menu;
    }*/
}
