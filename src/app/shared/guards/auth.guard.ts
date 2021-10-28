import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { StorageService } from 'src/app/services/storage.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private routes: Router,private storageService: StorageService) { }
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean |
     UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
      // if (this.storageService.secureStorage.getItem('auth-user') != null) {
      if (localStorage.getItem('auth-user') != null) {
        return true;
      } else {
      
        this.routes.navigate(['/authentication/login']);
        return false;
      }
  }
  
}
