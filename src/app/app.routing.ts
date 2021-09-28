import { Routes } from '@angular/router';

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
                path: 'indicadores',
                loadChildren: () => import('./indicadores/indicadores.module').then(m => m.IndicadoresModule)
            },
            {
                path: 'material',
                loadChildren: () => import('./material-component/material.module').then(m => m.MaterialComponentsModule)
            },
            {
                path: 'apps',
                loadChildren: () => import('./apps/apps.module').then(m => m.AppsModule)
            },
            {
                path: 'forms',
                loadChildren: () => import('./forms/forms.module').then(m => m.FormModule)
            },
            {
                path: 'tables',
                loadChildren: () => import('./tables/tables.module').then(m => m.TablesModule)
            },
            {
                path: 'tree',
                loadChildren: () => import('./tree/tree.module').then(m => m.TreeModule)
            },
            {
                path: 'datatables',
                loadChildren: () => import('./datatables/datatables.module').then(m => m.DataTablesModule)
            },
            {
                path: 'pages',
                loadChildren: () => import('./pages/pages.module').then(m => m.PagesModule)
            },
            {
                path: 'widgets',
                loadChildren: () => import('./widgets/widgets.module').then(m => m.WidgetsModule)
            },
            {
                path: 'charts',
                loadChildren: () => import('./charts/chartslib.module').then(m => m.ChartslibModule)
            },
            {
                path: 'multi',
                loadChildren: () => import('./multi-dropdown/multi-dd.module').then(m => m.MultiModule)
            }
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
