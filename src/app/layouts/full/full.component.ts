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
	companys:any;
	idIdioma:number=0;
	moneda:String='';

	public showSearch = false;
	public config: PerfectScrollbarConfigInterface = {};
	// tslint:disable-next-line - Disables all
	private _mobileQueryListener: () => void;
    private query: any;

	constructor(
		public router: Router,
		changeDetectorRef: ChangeDetectorRef,
		media: MediaMatcher,
		public menuItems: MenuItems,
		public userservice: UserService,
		private apollo: Apollo,
		private serviceAuth:AuthServiceService
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

     if(this.userservice.responseLogin){
		this.companys=this.userservice.responseLogin.companiaa;
		this.idIdioma=this.userservice.responseLogin.codIdioma;
		this.moneda=this.userservice.responseLogin.monedass[0].name;
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
