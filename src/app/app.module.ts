import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule,PreloadAllModules } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { DatePipe, HashLocationStrategy, LocationStrategy } from '@angular/common';
import { AppRoutes } from './app.routing';
import { AppComponent } from './app.component';

import { FlexLayoutModule } from '@angular/flex-layout';
import { FullComponent } from './layouts/full/full.component';
import { AppBlankComponent } from './layouts/blank/blank.component';


import { VerticalAppHeaderComponent } from './layouts/full/vertical-header/vertical-header.component';
import { VerticalAppSidebarComponent } from './layouts/full/vertical-sidebar/vertical-sidebar.component';
import { HorizontalAppSidebarComponent } from './layouts/full/horizontal-sidebar/horizontal-sidebar.component';

import { AppBreadcrumbComponent } from './layouts/full/breadcrumb/breadcrumb.component';


import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DemoMaterialModule } from './demo-material-module';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';

import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { PERFECT_SCROLLBAR_CONFIG } from 'ngx-perfect-scrollbar';
import { PerfectScrollbarConfigInterface } from 'ngx-perfect-scrollbar';
import { SharedModule } from './shared/shared.module';
import { SpinnerComponent } from './shared/spinner.component';

import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { GraphQLModule } from './graphql.module';


export function HttpLoaderFactory(http: HttpClient): any {
    const urir = 'http://localhost:4200'
  //const urir='https://app.banticanalytica.com'
    return new TranslateHttpLoader(http, urir+'/assets/i18n/', '.json');
}


const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
    suppressScrollX: true,
    wheelSpeed: 2,
    wheelPropagation: true
};


@NgModule({
    declarations: [
        AppComponent,
        FullComponent,
        VerticalAppHeaderComponent,
        SpinnerComponent,
        AppBlankComponent,
        VerticalAppSidebarComponent,
        AppBreadcrumbComponent,
        HorizontalAppSidebarComponent
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        DemoMaterialModule,
        FormsModule,
        FlexLayoutModule,
        HttpClientModule,
        PerfectScrollbarModule,
        SharedModule,
        NgMultiSelectDropDownModule.forRoot(),
        RouterModule.forRoot(AppRoutes,{ onSameUrlNavigation:'reload'}),
      // RouterModule.forRoot(AppRoutes, { relativeLinkResolution: 'legacy' }),
        HttpClientModule,
        TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                useFactory: HttpLoaderFactory,
                deps: [HttpClient]
            }
        }),
        GraphQLModule
    ],
    exports:[
        FullComponent
    ],
    providers: [
        {provide: LocationStrategy, useClass: HashLocationStrategy
        
        }, 
        DatePipe
    ],
  
    bootstrap: [AppComponent]
})
export class AppModule { }
