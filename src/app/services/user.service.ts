import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class UserService {
  responseLogin:any;
  List_categorias:any;
  public static ARRAY_CATEGORIAS:any[];
  readonly baseURL = 'https://indicadores.motel.com.bo/api/';
  private subjectLogin = new Subject<any>();
 /// user: User = new User();
  constructor(private http: HttpClient) { }
  

  sendMessageLogin(message: any) {
    this.subjectLogin.next(message);
  }

  clearMessagesLogin() {
    this.subjectLogin.next();
  }

  getMessage(): Observable<any> {
    return this.subjectLogin.asObservable();
  }
  getValidarLogin(user:String,clave:any) {
    return this.http.get(this.baseURL + 'ValidarLoginWeb?Usuario='+user+'&Clave='+clave);
  
  }
  getMenuRol(idRol:any) {
    console.log(idRol);
    return this.http.get(this.baseURL + 'Menu_Indicadores?idrolusuario='+idRol);
  
  }
  
}

