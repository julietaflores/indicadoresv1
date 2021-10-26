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


const MENUGRAPHQL= gql`
query lista_Menu($idusuario:Int!,$companiaid:Int!) {
  lista_Menu(idusuario: $idusuario,companiaid:$companiaid){
    categoriaCompaniaId
    nombre
    idCompania
    fechaRegistro
    estado
    tablero{
      idTablero
      nombreTablero
      estadoTablero
      urlTablero
      indicadores{
        idIndicador
        nombreIndicador
        estadoIndicador
        iDTablero
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
    lista_menu_array:any=[];         
    childrem:any[]=[];
    tableros:any[]=[];  
    categorias:any[]=[];  
    private query: any;
    idUsuario:Number|undefined;
    lang:String|undefined;

    constructor(private serviceuser:UserService,private apollo: Apollo,
        private serviceAuth:AuthServiceService) {    
        this.menuitems=[];
        this.menuitems.push(FIRSTITEM);
    
        if(this.serviceuser.responseLogin){
          
            this.idUsuario=this.serviceuser.responseLogin.idUsuario;
         
            this.lang=this.serviceuser.responseLogin.idioma.abreviaturaIdioma;
            this.query= this.apollo.watchQuery({
                query: MENUGRAPHQL,
                variables: { idusuario:this.idUsuario,companiaid:this.serviceuser.responseLogin.companiaa[0].idCompania}
              }).valueChanges.subscribe((result:any) => {
                if(result){
                    this.serviceuser.responseMenu=result;
                    const menuData: any= {
                       
                  
                      }
                }

                this.lista_menu_array=result.data.lista_Menu;
                this.lista_menu_array.forEach((list_m:any)=>{
                    this.tableros=list_m.tablero
                   // GlobalConstants.detalleTablero=.categoriass.tableross;
                    this.childrem=[];
                    this.tableros.forEach(element => {
                        this.childrem.push(
                            {
                                idtablero:element.idTablero,
                                state:element.urlTablero,
                                name:element.nombreTablero,
                                type: 'link'
                            }
                        );
                    });
                
                     let item={
                        state: 'tablero',
                        categoriacompaniaid: list_m.categoriaCompaniaId,
                        name: list_m.nombre,
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
        
                this.idUsuario=this.serviceAuth.userData?.idUsuario;
                this.lang=this.serviceAuth.userData?.language;
                this.query= this.apollo.watchQuery({
                    query: MENUGRAPHQL,
                    variables: { idusuario:this.idUsuario,companiaid:this.serviceAuth.userData?.companiaId}
                  });
              
                  this.query.valueChanges.subscribe((result:any) => {
     
                    this.lista_menu_array=result.data.lista_Menu;
                    this.lista_menu_array.forEach((list_m:any)=>{
                        this.tableros=list_m.tablero
                       // GlobalConstants.detalleTablero=.categoriass.tableross;
                        this.childrem=[];
                        this.tableros.forEach(element => {
                            this.childrem.push(
                                {
                                    idtablero:element.idTablero,
                                    state:element.urlTablero,
                                    name:element.nombreTablero,
                                    type: 'link'
                                }
                            );
                        });
                    
                         let item={
                            state: 'tablero',
                            categoriacompaniaid: list_m.categoriaCompaniaId,
                            name: list_m.nombre,
                            type: 'sub',
                            icon: 'av_timer',
                            children: this.childrem
                         }
                         this.menuitems.push(item);
                      
                      });
                  }); 
      
            }
        }
    }
    ngOnInit(): void {
       
    }
    
    getMenuitem(): Menu[] {
        return this.menuitems;
    }
    thisngOnDestroy(){
        this.query.unsubscribe();
      }
 
}
