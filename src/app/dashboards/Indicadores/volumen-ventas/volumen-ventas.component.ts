import { BreakpointObserver } from '@angular/cdk/layout';
import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { IndicadorVentas } from 'src/app/models/indicadorVentas.interface';


@Component({
  selector: 'app-volumen-ventas',
  templateUrl: './volumen-ventas.component.html',
  styleUrls: ['./volumen-ventas.component.scss']
})
export class VolumenVentasComponent implements OnInit {

  constructor(breakpointObserver: BreakpointObserver) {
     
  }

  ngOnInit(): void {
  }
  


}
