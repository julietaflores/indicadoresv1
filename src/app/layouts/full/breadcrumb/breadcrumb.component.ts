import {
  Component,
  OnInit
} from '@angular/core';
import { Title } from '@angular/platform-browser';

import { Router, NavigationEnd, ActivatedRoute, Data } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { filter, map, mergeMap } from 'rxjs/operators';
import { pageinf } from 'src/app/models/pageinfoo';

@Component({
  selector: 'app-breadcrumb',
  templateUrl: './breadcrumb.component.html',
  styleUrls: []
})
export class AppBreadcrumbComponent {
  pageInfo: Data = Object.create(null);
  pageInfo2:any=Object.create(null); 

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private titleService: Title,
  
  ) {
   

     let pageif: any = localStorage.getItem('titulo_izquierdo');
      pageif = JSON.parse(pageif);
     console.log('err '+JSON.stringify(pageif));


    const pageinf: pageinf = {
       title: pageif.title
    }
  
  //   const pageinf: pageinf = {
  //     title: 'dd'
  //  }
 

    this.pageInfo = pageinf;
  }

}
