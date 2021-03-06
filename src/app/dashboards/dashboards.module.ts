
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DemoMaterialModule } from '../demo-material-module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { DashboardsRoutes } from './dashboards.routing';
import { ChartistModule } from 'ng-chartist';
import { ChartsModule } from 'ng2-charts';
import { NgApexchartsModule } from 'ng-apexcharts';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { Dashboard1Component } from './dashboard1/dashboard1.component';

import {
    TopCardComponent,
    SalesOverviewComponent,
    VisitorComponent,
    Visitor2Component,
    IncomeExpenssComponent,
    PostsComponent,
    NewsletterComponent,
    DeveloperInfoComponent,
    ActivityComponent,
    TopCard2Component,
    SalesPurchaseComponent,
    SalesYearlyComponent,
    ContactListComponent,
    CommentsComponent,
    MessageComponent
} from './dashboard-components';
import { DashboardEmpComponent } from './dashboard-components/dashboard-emp/dashboard-emp.component';
import { EmpDialogComponent } from './dashboard-components/dashboard-emp/emp-dialog/emp-dialog.component';
import { AppBreadcrumbComponent } from '../layouts/full/breadcrumb/breadcrumb.component';
import { FullComponent } from '../layouts/full/full.component';
import { CoinsInstanceComponent } from './dashboard-components/coins-instance/coins-instance.component';
import { CompanysInstanceComponent } from './dashboard-components/companys-instance/companys-instance.component';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpClient, HttpClientModule } from '@angular/common/http';
// import { HttpLoaderFactory } from '../tablero/tablero.module';

export function HttpLoaderFactory(http: HttpClient): any {
  //  const urir = 'http://localhost:4200'
    const urir='https://app.banticanalytica.com'
    return new TranslateHttpLoader(http, urir+'/assets/i18n/', '.json');
  }
TranslateModule.forRoot({
    loader: {
      provide: TranslateLoader,
      useFactory: httpTranslateLoader,
      deps: [HttpClient]
    }
  })
@NgModule({
    imports: [
        CommonModule,
        DemoMaterialModule,
        FlexLayoutModule,
        ChartistModule,
        ChartsModule,
        NgApexchartsModule,
        RouterModule.forChild(DashboardsRoutes),
        FormsModule,
        ReactiveFormsModule,
        TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                useFactory: HttpLoaderFactory,
                deps: [HttpClient]
            }
        }),
    ],
    exports:[
        SalesPurchaseComponent,
        SalesOverviewComponent,
        IncomeExpenssComponent
    ],
    declarations: [
        Dashboard1Component,
        TopCardComponent,
        SalesOverviewComponent,
        VisitorComponent,
        Visitor2Component,
        IncomeExpenssComponent,
        PostsComponent,
        NewsletterComponent,
        DeveloperInfoComponent,
        ActivityComponent,
        TopCard2Component,
        SalesPurchaseComponent,
        SalesYearlyComponent,
        ContactListComponent,
        CommentsComponent,
        MessageComponent,
        DashboardEmpComponent,
        EmpDialogComponent,
        CoinsInstanceComponent,
        CompanysInstanceComponent
    ],
    entryComponents: [
        EmpDialogComponent
    ]
})
export class DashboardsModule { }
export function httpTranslateLoader(http: HttpClient) {
    return new TranslateHttpLoader(http);
  }