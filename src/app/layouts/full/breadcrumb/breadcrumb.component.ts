import {
  Component,
  OnInit
} from '@angular/core';
import { Title } from '@angular/platform-browser';

import { Router, NavigationEnd, ActivatedRoute, Data } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { filter, map, mergeMap } from 'rxjs/operators';

@Component({
  selector: 'app-breadcrumb',
  templateUrl: './breadcrumb.component.html',
  styleUrls: []
})
export class AppBreadcrumbComponent {
  // @Input() layout;
  pageInfo: Data = Object.create(null);
  pageInfo2:any=Object.create(null); 
 
  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private titleService: Title,
  
  ) {
    const titlePattern = this.activatedRoute.snapshot.data['title'];
    const id = this.activatedRoute.snapshot.params['indicator'];
    //this.title = titlePattern.replace('[id]', id);
  
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .pipe(map(() => this.activatedRoute))
      .pipe(
        map(route => {
          let urls:any[]=[];
          while (route.firstChild) {
            route = route.firstChild;
            
            route.url.forEach((element:any) => {
             
              let arrays=String(element).split(';',2);
              let url=arrays[0];
              let title2=arrays[1];
              let title=String(title2).split('=',2)[1];
              title=decodeURI(title);
              url=decodeURI(url);
           
              urls.push(url);
              this.pageInfo={
                urls:urls,
              //  title:title
              title:''
              }

              //title2=title2.split('=',0)[1];
              
       

          });   


          }
          return route;
        })

        
      )
      .pipe(filter(route => route.outlet === 'primary'))
      .pipe(mergeMap(route => route.data)) 
      .subscribe(event => {
        this.titleService.setTitle(event['title']);
    // this.titleService.setTitle('');
       // this.pageInfo = event;
        console.log(this.pageInfo);
      });
  }

}
