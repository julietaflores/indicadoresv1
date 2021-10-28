import { MediaMatcher } from '@angular/cdk/layout';
import { Router } from '@angular/router';
import {
	ChangeDetectorRef,
	Component,
	OnDestroy,
	OnInit
} from '@angular/core';
import { MenuItems } from '../../shared/menu-items/menu-items';


import { PerfectScrollbarConfigInterface, PerfectScrollbarDirective } from 'ngx-perfect-scrollbar';

import { Apollo, QueryRef } from 'apollo-angular';
import gql from 'graphql-tag';
import { UserService } from '../../services/user.service';
import { AuthServiceService } from 'src/app/services/auth-service.service';
import { GlobalConstants } from 'src/app/GLOBALS/GlobalConstants';
import { UserAuth } from 'src/app/models/userAuth.interface';
const LOGIN = gql`
  query validarlogin($usuario:String,$clave:String) {
    validarlogin(usuario: $usuario, clave: $clave) {
     

      idUsuario
      nombreUsuario
      usuario
      fechacreacionusuario
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


/** @title Responsive sidenav */
@Component({
	selector: 'app-full-layout',
	templateUrl: 'full.component.html',
	styleUrls: []
})
export class FullComponent implements OnDestroy {
	mobileQuery: MediaQueryList;

	dir = 'ltr';
	dark = false;
	minisidebar = false;
	boxed = false;
	horizontal = false;

	green = false;
	blue = false;
	danger = false;
	showHide = false;
	url = '';
	sidebarOpened = false;
	status = false;
	// companyName:any=service.responseLogin.valor.Companiaa[0].Name;
	companys: any;
	idIdioma: number = 0;
	moneda: String = '';
	campo:string |undefined;

	public showSearch = false;
	public config: PerfectScrollbarConfigInterface = {};
	// tslint:disable-next-line - Disables all
	private _mobileQueryListener: () => void;
	private query: any;
	userData_aux: UserAuth | null = null;

	constructor(
		public router: Router,
		changeDetectorRef: ChangeDetectorRef,
		media: MediaMatcher,
		public menuItems: MenuItems,
		public userservice: UserService,
		private apollo: Apollo,
		private serviceAuth: AuthServiceService
	) {


		this.mobileQuery = media.matchMedia('(min-width: 1100px)');
		this._mobileQueryListener = () => changeDetectorRef.detectChanges();
		// tslint:disable-next-line: deprecation
		this.mobileQuery.addListener(this._mobileQueryListener);
		// this is for dark theme
		// const body = document.getElementsByTagName('body')[0];
		// body.classList.toggle('dark');
		this.dark = false;


	}

	ngOnDestroy(): void {
		// tslint:disable-next-line: deprecation
		this.mobileQuery.removeListener(this._mobileQueryListener);
		//console.log(this.userservice.responseLogin.valor.IdRolUsuario);
	}


	ngOnInit() {

		if (this.userservice.responseLogin) {
			
        //   alert('dd')
		
			this.companys = this.userservice.responseLogin.companiaa;
			this.idIdioma = this.userservice.responseLogin.codIdioma;


			this.userData_aux=null;
			this.userData_aux= this.serviceAuth.Obtener_ls_authuser();
			console.log('list cifra notables inicio'+ JSON.stringify(this.userData_aux));
			console.log('variable inicio'+ JSON.stringify(this.userData_aux?.ls_idMonedaOdoo));
		

			for (let listac of GlobalConstants.listCompanys){
				if(listac.idCompania==this.userData_aux?.companiaId){
					
				   //  GlobalConstants.listMonedas = listac.monedass.info_moneda;
		 
				  
		 
					// this.companySelected = listac.name;
					 this.moneda = listac.monedass.info_moneda.name;
		 
				}
			  }
		 


		//	this.moneda = this.userservice.responseLogin.monedass.info_moneda.find((item:any)=>
		//		item.idMonedaOdoo==this.userservice.responseLogin.companiaa[0].idMonedaOdoo).name;
				console.log("moneda "+this.moneda);
		}



		//const body = document.getElementsByTagName('body')[0];
		// body.classList.add('dark');

	}

	clickEvent(): void {
		this.status = !this.status;
	}

	darkClick() {
		// const body = document.getElementsByTagName('body')[0];
		// this.dark = this.dark;
		const body = document.getElementsByTagName('body')[0];
		body.classList.toggle('dark');
		// if (this.dark)
		// else
		// 	body.classList.remove('dark');
		// this.dark = this.dark;
		// body.classList.toggle('dark');
		// this.dark = this.dark;
	}



}
