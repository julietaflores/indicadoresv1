import { Routes,RouterModule,PreloadAllModules } from '@angular/router';
import { FullComponent } from './layouts/full/full.component';
import { AppBlankComponent } from './layouts/blank/blank.component';
import { LoginComponent } from './authentication/login/login.component';
import { AuthGuard } from './shared/guards/auth.guard';

export const AppRoutes: Routes = [
    {
        path: '',
        component: FullComponent,
        canActivate: [AuthGuard],
        children: [
            {
                path: '',
                redirectTo: '/dashboards/Inicio',
                pathMatch: 'full'
            },
             {
                path: 'Inicio',
                redirectTo: '/dashboards/Inicio',
                pathMatch: 'full'
            },
            {
                path: 'dashboards',
                loadChildren: () => import('./dashboards/dashboards.module').then(m => m.DashboardsModule)
            },
            {
                path: 'tablero',
                loadChildren: () => import('./tablero/tablero.module').then(m => m.TableroModule)
            },
           
            {
                path: 'material',
                loadChildren: () => import('./material-component/material.module').then(m => m.MaterialComponentsModule)
            },
         
         
            {
                path: 'tables',
                loadChildren: () => import('./tables/tables.module').then(m => m.TablesModule)
            },
           
         
            {
                path: 'pages',
                loadChildren: () => import('./pages/pages.module').then(m => m.PagesModule)
            },
         
         
        ]
    },
    {
        path: '',
        redirectTo: '/dashboards/Inicio',
        pathMatch: 'full'
    },
     {
        path: 'Inicio',
        redirectTo: '/dashboards/Inicio',
        pathMatch: 'full'
    },
    {
        path: 'dashboards',
        loadChildren: () => import('./dashboards/dashboards.module').then(m => m.DashboardsModule)
    },
    {
        path: 'tablero',
        loadChildren: () => import('./tablero/tablero.module').then(m => m.TableroModule)
    },
    
    {
        path: '',
        component: AppBlankComponent,
        children: [
            {
                path: 'authentication',
                loadChildren:
                    () => import('./authentication/authentication.module').then(m => m.AuthenticationModule)
            }
        ]
    },
    {
        path: '**',
        redirectTo: 'authentication/404'
    }
];
