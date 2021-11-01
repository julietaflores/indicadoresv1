import { T } from '@angular/cdk/keycodes';
import { Injectable, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';

import { Apollo, QueryRef } from 'apollo-angular';
import gql from 'graphql-tag';
import { UserService } from '../../services/user.service';
import { AuthServiceService } from 'src/app/services/auth-service.service';
import { GlobalConstants } from 'src/app/GLOBALS/GlobalConstants';
import { UserAuth } from 'src/app/models/userAuth.interface';
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
    userData_aux: UserAuth | null = null;

    constructor(private serviceuser:UserService,private apollo: Apollo,
        private serviceAuth:AuthServiceService) {    
        this.menuitems=[];
        this.menuitems.push(FIRSTITEM);
    
        if(this.serviceuser.responseLogin){


//            alert('ccf')



            this.userData_aux= this.serviceAuth.Obtener_ls_authuser();
        //    console.log('list cifra notables ingresoo '+ JSON.stringify(this.userData_aux));
         

            this.idUsuario=this.userData_aux?.idUsuario;
            this.lang=this.userData_aux?.language;
            this.query= this.apollo.watchQuery({
                query: MENUGRAPHQL,
                variables: { idusuario:this.idUsuario,companiaid:this.userData_aux?.companiaId}
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
  //      alert('cc');
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
