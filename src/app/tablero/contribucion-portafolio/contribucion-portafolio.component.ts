import { Component, OnInit } from '@angular/core';
import { ChartDataSets, ChartOptions, ChartType } from 'chart.js';
import { Label } from 'ng2-charts';

@Component({
  selector: 'app-contribucion-portafolio',
  templateUrl: './contribucion-portafolio.component.html',
  styleUrls: ['./contribucion-portafolio.component.scss']
})
export class ContribucionPortafolioComponent implements OnInit {

  public barChartOptions: ChartOptions= {
    responsive: true,
  };
  public barChartLabels: Label[] = ['2006', '2007', '2008', '2009', '2010', '2011', '2012'];
  public barChartType: ChartType = 'bar';
  public barChartLegend = true;
  public barChartPlugins = [];

    public barChartData: ChartDataSets[] = [
      { data: [65, 59, 80, 81, 56, 55, 40], label: 'Series A', stack: 'a' },
      { data: [28, 48, 40, 19, 86, 27, 90], label: 'Series B', stack: 'a' }
    ];
  constructor() { }

  ngOnInit(): void {
  }

}
