import { C } from '@angular/cdk/keycodes';
import { Injectable } from '@angular/core';
import { UserAuth } from '../models/userAuth.interface';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class AuthServiceService {

  public userData: UserAuth | null = null;

  constructor(private storageService: StorageService) {
    this.updateStorage();
  }



 Obtener_ls_authuser() {
    
    const userData = localStorage.getItem('auth-user');
    if (userData) {
   
       this.userData=JSON.parse(userData);
       this.userData = JSON.parse(userData);

       console.log('list '+JSON.stringify(this.userData));
      
    } else {

      this.userData = null;
    }
   return this.userData
  }


  updateStorage() {
    //const userData = this.storageService.secureStorage.getItem('auth-user');
    //  console.log(JSON.parse(userData));
    const userData = localStorage.getItem('auth-user');
    if (userData) {

       this.userData=JSON.parse(userData);
       this.userData = JSON.parse(userData);
      //this.userData = userData;
    } else {

      this.userData = null;
    }
  }
  login(userAuth: UserAuth) {
   // this.storageService.secureStorage.setItem('auth-user', userAuth);

   
   console.log('primer campo '+JSON.stringify(userAuth));

     localStorage.setItem('auth-user',JSON.stringify(userAuth));
  }
  logout() {
  
    //const userData = this.storageService.secureStorage.getItem('auth-user');
    const userData=localStorage.getItem('auth-user');
    if (userData) {
      this.userData = JSON.parse(userData);
    } else {
      this.userData = null;
    }
 
    if (userData !== null) {
    
    
      localStorage.removeItem('auth-user');
      //this.storageService.secureStorage.removeItem('auth-user');
      localStorage.clear();
      this.updateStorage();

    } else {
      this.updateStorage();

    }
  }
  isLoggedIn() {
    return this.userData !== null;
  }



  updateStoragef(userAuth: UserAuth) {
   // this.storageService.secureStorage.removeItem('auth-user');
   // this.storageService.secureStorage.setItem('auth-user', userAuth);

    localStorage.removeItem('auth-user');
    localStorage.setItem('auth-user', JSON.stringify(userAuth));
   
   // const userData = this.storageService.secureStorage.getItem('auth-user');
    const userData=localStorage.getItem('auth-user');
    if (userData) {
      this.userData = JSON.parse(userData);
    } else {
      this.userData = null;
    }


  }



}
