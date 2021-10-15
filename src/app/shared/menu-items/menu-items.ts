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


const MENUITEMS = [
   /* {
        state: '',
        name: 'Personal',
        type: 'saperator',
        icon: 'av_timer'
    },*/
    {
        state: 'dashboards',
        name: 'Dashboards',
        type: 'sub',
        icon: 'av_timer',
        children: [
            { state: 'dashboard1', name: 'Dashboard 1', type: 'link' },
            { state: 'dashboard2', name: 'Dashboard 2', type: 'link' }
        ]
    },
  
    {
        state: 'tablero',
        name: 'Tablero',
        type: 'sub',
        icon: 'business',
        children: [
            { state: 'cifrasNotables', name: 'Volumen (m3)', type: 'link' },
            { state: 'dashboard2', name: 'Ventas (US$ 000)', type: 'link' },
            { state: 'dashboard3', name: 'Precio Promedio (m3)', type: 'link' }
           
        ]
    },
    {
        state: 'datatables',
        name: 'Data Tables',
        type: 'sub',
        icon: 'border_all',
        children: [
            { state: 'basicdatatable', name: 'Basic Data Table', type: 'link' },
            { state: 'filter', name: 'Filterable', type: 'link' },
            { state: 'editing', name: 'Editing', type: 'link' },
            { state: 'materialtable', name: 'Material Table', type: 'link' }
        ]
    },
    {
        state: 'widgets',
        name: 'Widgets',
        type: 'link',
        icon: 'widgets'
    },
    {
        state: '',
        name: 'Extra Component',
        type: 'saperator',
        icon: 'av_timer'
    },
    {
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
    },
    {
        state: 'charts',
        name: 'Charts',
        type: 'sub',
        icon: 'insert_chart',
        children: [
            { state: 'chartjs', name: 'Chart Js', type: 'link' },
            { state: 'chartistjs', name: 'Chartist Js', type: 'link' },
            { state: 'ngxchart', name: 'Ngx Charts', type: 'link' }
        ]
    },
    {
        state: 'pages',
        name: 'Pages',
        type: 'sub',
        icon: 'content_copy',
        children: [
            { state: 'timeline', name: 'Timeline', type: 'link' },
            { state: 'invoice', name: 'Invoice', type: 'link' },
            { state: 'pricing', name: 'Pricing', type: 'link' },
            { state: 'helper', name: 'Helper Classes', type: 'link' },
            {
                state: 'icons',
                name: 'Icons',
                type: 'subchild',
                subchildren: [
                    {
                        state: 'material',
                        name: 'Material Icons',
                        type: 'link'
                    }
                ]
            }
        ]
    }
];
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
        // {state:'Performance_general_(Regiones)',name:'Performance general (Regiones)',type:'link'}
    ]
}
const ComposicionVentas={
    state:'tablero',
    name: 'Composicion Ventas',
    type: 'sub',
    icon:'perm_contact_calendar',
    children:[
        {state:'Composicion_Ventas',name:'Composicion de Ventas',type:'link'}
        // {state:'Performance_general_(Regiones)',name:'Performance general (Regiones)',type:'link'}
    ]
}
const MargenesBrutos={
    state:'tablero',
    name: 'Margenes Brutos',
    type: 'sub',
    icon:'perm_contact_calendar',
    children:[
        {state:'Margenes_Brutos_Lineas',name:'Margenes Brutos Lineas',type:'link'}
        // {state:'Performance_general_(Regiones)',name:'Performance general (Regiones)',type:'link'}
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
      
            }else{
                
              //  alert('cc46');
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
   /* setItems(Menu[]:menu):void {
      this.menuitems=menu;
    }*/
}
