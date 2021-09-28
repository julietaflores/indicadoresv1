import { Routes } from '@angular/router';
import { VentasComponent } from './ventas/ventas.component';

export const IndicadoresRoutes: Routes = [
    {
        path: '',
        children: [
            {
                path: 'Ventas',
                component: VentasComponent,
                data: {
                    title: 'Ventas',
                    urls: [
                        { title: 'Dashboard', url: '/dashboard' },
                        { title: 'Ventas' }
                    ]
                }
            }
        ]
    }
];
