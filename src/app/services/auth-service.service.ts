import { Injectable } from '@angular/core';
import { UserAuth } from '../models/userAuth.interface';

@Injectable({
  providedIn: 'root'
})
export class AuthServiceService {
  
  public userData:UserAuth| null = null;

  constructor() {
    this.updateStorage();
   }
  updateStorage(){
    const userData = localStorage.getItem('auth-user');
    if(userData){
      this.userData=JSON.parse(userData);
    }else{
      this.userData=null;
    }
  }
  login(userAuth:UserAuth){
     localStorage.setItem('auth-user',JSON.stringify(userAuth));
  }
  logout(){
    if(!this.isLoggedIn()) return;
    localStorage.removeItem('auth-user');
    localStorage.clear();
    this.updateStorage();
  }
  isLoggedIn(){
    return this.userData !== null;
  }
}
