import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { GlobalConstants } from '../GLOBALS/GlobalConstants';

@Injectable({
  providedIn: 'root'
})
export class IndicadoresService {
  
  List_categorias:any;
  public static ARRAY_CATEGORIAS:any[];
  private subjectLogin = new Subject<any>();

  readonly baseURL = 'https://indicadores.motel.com.bo/api/';
  constructor(private http: HttpClient) { }
  
  sendMessageIndicadores(message: any) {
    console.log('servicio login');
    this.subjectLogin.next(message);
  }

  clearMessagesIndicadores() { 
    this.subjectLogin.next();
  }

  getMessageIndicadores(): Observable<any> {
    return this.subjectLogin.asObservable();
  }
  getIndicadorVentas(userId:any,gestion:any,mes:any,
    idcompaniaodoo:any,IdMonedaEmpresaOdoo:any) {
    
    return this.http.get(this.baseURL + "Indicador_ventas?userid="+userId+
    "&gestion="+ gestion+"&mes="+mes+"&idcompaniaodoo="+idcompaniaodoo+"&IdMonedaEmpresaOdoo="+IdMonedaEmpresaOdoo);
  
  }
}
