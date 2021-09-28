import { Component, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { UserService } from '../../services/user.service';
import { Apollo, QueryRef } from 'apollo-angular';
import gql from 'graphql-tag';
import { AuthServiceService } from 'src/app/services/auth-service.service';
import { GlobalConstants } from 'src/app/GLOBALS/GlobalConstants';

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard1.component.html',
    styleUrls: ['./dashboard1.component.scss']
})
export class Dashboard1Component{
   
   // subscription: Subscription;
    user:any;

    constructor(private serviceuser:UserService) { 
      /*  this.subscription = this.serviceuser.getMessage().subscribe(messagelogin => {
            if (messagelogin) {
              this.user=messagelogin;
              console.log(this.user);
            } 
         });*/
    }
    

    ngOnInit(): void {
     console.log("dashboard1");
   
    }

  
}
