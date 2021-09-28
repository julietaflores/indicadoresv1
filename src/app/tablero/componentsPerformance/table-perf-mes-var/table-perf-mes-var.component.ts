import { BreakpointObserver } from '@angular/cdk/layout';
import { Component, Input, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Apollo, QueryRef } from 'apollo-angular';
import gql from 'graphql-tag';
import { UserService } from 'src/app/services/user.service';

const QIVARS = gql`
query raking_lista_mesanual($idrol1:Int!,$anioo:Int!,$mess:String,$companiaa:Int!, $monedadestinoo:Int!,
  $proidd:Int!) {
  raking_lista_mesanual(idrol1:$idrol1,anioo:$anioo,mess:$mess,companiaa:$companiaa,
     monedadestinoo:$monedadestinoo,proidd:$proidd){
      lista{
        idIndicador
        nombreIndicador
        monto_Mes
        porcentaje_Monto_Mes
        monto_Acumulado
        porcentaje_Monto_Acumulado
        vs
      }
  } 
}
`;
@Component({
  selector: 'app-table-perf-mes-var',
  templateUrl: './table-perf-mes-var.component.html',
  styleUrls: ['./table-perf-mes-var.component.scss']
})
export class TablePerfMesVarComponent implements OnInit {
  displayedColumnsMesVars: String[] = ['p_cantidad', 'p_ventas', 'p_precio'];
  @Input() 
  listVarsMes:any[]=[];
  @Input() 
  dataSourceVARS:any;
  
  constructor(public breakpointObserver: BreakpointObserver, public userservice: UserService) { 
   // this.dataSourceVARS = new MatTableDataSource<TopVar>(this.listVarsMes);
  }

  ngOnInit(): void {
    console.log(this.dataSourceVARS);
  }
  ngAfterViewInit(): void {
    
  }

}
export interface TopVar{
  p_cantidad:any;
  p_ventas:any;
  p_precio:any;
}

