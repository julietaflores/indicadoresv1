import { Routes } from '@angular/router';

import { Dashboard1Component } from './dashboard1/dashboard1.component';
import { FullComponent } from '../layouts/full/full.component';
export const DashboardsRoutes: Routes = [
 
 {
    path: '',
    component:  Dashboard1Component,
   
  },
  {
    path: 'Inicio',
    component: Dashboard1Component,
    data: {
      title: 'Inicio'
    }
  }
];
