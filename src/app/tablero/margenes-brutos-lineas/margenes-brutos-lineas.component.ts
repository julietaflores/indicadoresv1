import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-margenes-brutos-lineas',
  templateUrl: './margenes-brutos-lineas.component.html',
  styleUrls: ['./margenes-brutos-lineas.component.scss']
})
export class MargenesBrutosLineasComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }
    // This is line chart
  // bar chart
  public barChartOptions: any = {
    scaleShowVerticalLines: false,
    responsive: true,
    barThickness: 10
  };

  public barChartLabels: string[] = [
    '2011',
    '2012',
    '2013',
    '2014',
    '2015',
    '2016',
    '2017'
  ];
  public barChartType = 'horizontalBar';
  public barChartLegend = true;

  public barChartData: any[] = [
    { data: [65, 59, 80, 81, 56, 55, 40], label: 'Iphone 8' },
    { data: [28, 48, 40, 19, 86, 27, 90], label: 'Iphone X' }
  ];
  public barChartColors: Array<any> = [
    { backgroundColor: '#1976d2' },
    { backgroundColor: '#26dad2' }
  ];
  displayedColumns = ['position', 'name', 'weight', 'symbol'];
  dataSource = new MatTableDataSource<Element>(ELEMENT_DATA);
  public chartHovered(e: any): void {
    // console.log(e);
  }
     // events
     public chartClicked(e: any): void {
      // console.log(e);
    }
  
}
export interface Element {
  name: string;
  position: number;
  weight: number;
  symbol: string;
}

const ELEMENT_DATA: Element[] = [
  { position: 1, name: 'Hydrogen', weight: 1.0079, symbol: 'H' },
  { position: 2, name: 'Helium', weight: 4.0026, symbol: 'He' },
  { position: 3, name: 'Lithium', weight: 6.941, symbol: 'Li' },
  { position: 4, name: 'Beryllium', weight: 9.0122, symbol: 'Be' },
  { position: 5, name: 'Boron', weight: 10.811, symbol: 'B' }
];

export interface MargenBruto {
  producto: string;
  porcentaje_margen: string;
  bps: string;
  moneda: number;
}
