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
  updateStorage() {
    const userData = this.storageService.secureStorage.getItem('auth-user');
    //  console.log(JSON.parse(userData));
    //const userData = localStorage.getItem('auth-user');
    if (userData) {
      // this.userData=userData;
      // this.userData = JSON.parse(userData);
      this.userData = userData;
    } else {

      this.userData = null;
    }
  }
  login(userAuth: UserAuth) {
    this.storageService.secureStorage.setItem('auth-user', userAuth);
 
    // localStorage.setItem('auth-user',JSON.stringify(userAuth));
  }
  logout() {
    // // if(!this.isLoggedIn()) return;
    // // localStorage.removeItem('auth-user');
    // // localStorage.clear();
    // // this.updateStorage();
    const userData = this.storageService.secureStorage.getItem('auth-user');

    if (userData) {
      //  console.log(JSON.parse(userData));
      //this.userData = JSON.parse(userData);
      this.userData = userData;
      //  console.log(JSON.parse(userData));
    } else {
      this.userData = null;
    }
    //console.log(this.userData);
    if (userData !== null) {
      //  alert('esta logueado')

      this.storageService.secureStorage.removeItem('auth-user');
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
    localStorage.removeItem('auth-user');
    localStorage.setItem('auth-user', JSON.stringify(userAuth));


    const userData = localStorage.getItem('auth-user');

    if (userData) {
      this.userData = JSON.parse(userData);
    } else {
      this.userData = null;
    }


  }



}
