import { Routes } from '@angular/router';

import { MatIconComponent } from './material-icons/mat-icon.component';


export const PagesRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'icons/material',
        component: MatIconComponent,
        data: {
          title: 'Material Icons',
          urls: [
            { title: 'Dashboard', url: '/dashboard' },
            { title: 'Material Icons' }
          ]
        }
      }
    ]
  }
];
