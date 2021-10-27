import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class UserService {
  responseLogin:any;
  responseMenu:any;
  List_categorias:any;
  public static ARRAY_CATEGORIAS:any[];
  private subjectLogin = new Subject<any>();
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
  
  
}

