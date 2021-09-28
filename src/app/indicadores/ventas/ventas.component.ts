import { BreakpointObserver } from '@angular/cdk/layout';
import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { GlobalConstants } from 'src/app/GLOBALS/GlobalConstants';
import { IndicadorVentas } from 'src/app/models/indicadorVentas.interface';
import { IndicadoresService } from 'src/app/services/indicadores.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-ventas',
  templateUrl: './ventas.component.html',
  styleUrls: ['./ventas.component.scss']
})
export class VentasComponent implements OnInit {
  Monto_Acumulado:any;
  Monto_Mes:any;
  Porcentaje_Monto_Acumulado:any;
  Porcentaje_Monto_Mes:any;
  element_data:any[] =[];
  dataSource:any;
  coins:any[]=[];
  
  selectedyear=String(new Date().getFullYear());
 
  Month=Number(new Date().getMonth()+1);
  selectedMonth=String(this.getCurrenlyMonth());
  
  selectedCoin=this.userservice.responseLogin.valor.Companiaa[0].IdMonedaEmpresaOdoo;
  years: any[] = [
    { value: '2021', viewValue: '2021' },
    { value: '2020', viewValue: '2020' },
    { value: '2019', viewValue: '2019' }
  ];
  months: any[] = [
    { value: '01', viewValue: 'Enero' },
    { value: '02', viewValue: 'Febrero' },
    { value: '03', viewValue: 'Marzo' },
    { value: '04', viewValue: 'Abril' },
    { value: '05', viewValue: 'Mayo' },
    { value: '06', viewValue: 'Junio' },
    { value: '07', viewValue: 'Julio' },
    { value: '08', viewValue: 'Agosto' },
    { value: '09', viewValue: 'Septiembre' },
    { value: '10', viewValue: 'Octubre' },
    { value: '11', viewValue: 'Noviembre' },
    { value: '12', viewValue: 'Marzo' }
  ];
 // selectedMonth=String(this.months[this.Month-1].viewValue);


  constructor(public breakpointObserver: BreakpointObserver,
    public userservice:UserService,public indicadorservice:IndicadoresService) {

      this.userservice.responseLogin.valor.Monedass.forEach((item:any)=>{
               const coin={
                value: item.IdMonedaEmpresaOdoo, viewValue: item.Name
               }
               this.coins.push(coin);
      });
      this.breakpointObserver.observe(['(max-width: 600px)']).subscribe(result => {
        this.displayedColumns = result.matches ?
            ['Monto_Mes', 'Monto_Acumulado'] :
            ['Monto_Mes', 'Monto_Acumulado'];
      
      });
}

displayedColumns =  ['Monto_Mes', 'Monto_Acumulado'];
displayedColumnsPorcentaje =  ['P_Monto_Mes', 'P_Monto_Acumulado'];



ngOnInit(): void {
 // console.log(this.userservice.responseLogin.valor.Companiaa.IdMonedaEmpresaOdoo);

this.indicadorservice.getMessageIndicadores().subscribe(
  (res:any)=>{console.log(res)
  // this.element_data = res;
    let monto_mes_acumulado={
      'Monto_Mes':res[0].Monto_Mes,
      'Monto_Acumulado':res[0].Monto_Acumulado
    };
    let porcentaje_mes_acumulado={
      'Monto_Mes':res[0].P_Monto_Mes,
      'Monto_Acumulado':res[0].P_Monto_Acumulado
    }
  
   this.element_data.push(monto_mes_acumulado);
   this.element_data.push(porcentaje_mes_acumulado);

    //console.log(monto_acumulado);
    this.dataSource = new MatTableDataSource<any>(this.element_data); 
  }
);
}
getCurrenlyMonth(){
  let month = new Date().getMonth()+1;
  if(month<10){
    return "0"+month;
  }
  else{
    return month;
  }
}
onYearChange(event:any) {
  let anio=event.value;
  console.log(this.selectedyear);
  this.selectedyear=event.value;
  console.log(this.selectedMonth);
  console.log(this.selectedCoin);
  console.log(this.userservice.responseLogin.valor.Monedass);
  console.log(this.months[this.Month-1].viewValue);
  this.indicadorservice.clearMessagesIndicadores();
  this.indicadorservice.getIndicadorVentas(
    this.userservice.responseLogin.valor.idUsuario,
    this.selectedyear,
    this.selectedMonth,
    this.userservice.responseLogin.valor.Companiaa[0].IdCompaniaOdoo,
    Number(this.selectedCoin)).subscribe((res:any)=>{

    this.indicadorservice.sendMessageIndicadores([{
      'Monto_Mes':res.valor.Monto_Mes,
      'Monto_Acumulado':res.valor.Monto_Acumulado,
      'P_Monto_Mes':res.valor.Porcentaje_Monto_Mes+"%", 
      'P_Monto_Acumulado':res.valor.Porcentaje_Monto_Acumulado+"%"}]);
    });
}
onMonthChange(event:any) {
  let month=event.value;
  console.log(this.selectedyear);
  this.selectedMonth=event.value;
  console.log(this.selectedMonth);
  console.log(this.selectedCoin);
  this.indicadorservice.clearMessagesIndicadores();
  this.indicadorservice.getIndicadorVentas(
    this.userservice.responseLogin.valor.idUsuario,
    this.selectedyear,
    this.selectedMonth,
    this.userservice.responseLogin.valor.Companiaa[0].IdCompaniaOdoo,
    Number(this.selectedCoin)).subscribe((res:any)=>{
   
      /*GlobalConstants.indicadorVentas=[res.valor.Monto_Mes,res.valor.Monto_Acumulado, 
      res.valor.Porcentaje_Monto_Mes, res.valor.Porcentaje_Monto_Acumulado];*/
    this.indicadorservice.sendMessageIndicadores([{
      'Monto_Mes':res.valor.Monto_Mes,
      'Monto_Acumulado':res.valor.Monto_Acumulado,
      'P_Monto_Mes':res.valor.Porcentaje_Monto_Mes+"% vs " + res.valor.vs, 
      'P_Monto_Acumulado':res.valor.Porcentaje_Monto_Acumulado+"% vs " + res.valor.vs}]);
    });
}
onCoinChange(event:any) {
 
  let coin=event.value;
  console.log(this.selectedyear);
  this.selectedCoin=event.value;
  console.log(this.selectedMonth);
  console.log(this.selectedCoin);
  this.indicadorservice.clearMessagesIndicadores();
  this.indicadorservice.getIndicadorVentas(
    this.userservice.responseLogin.valor.idUsuario,
    this.selectedyear,
    this.selectedMonth,
    this.userservice.responseLogin.valor.Companiaa[0].IdCompaniaOdoo,
    Number(this.selectedCoin)).subscribe((res:any)=>{
   
      /*GlobalConstants.indicadorVentas=[res.valor.Monto_Mes,res.valor.Monto_Acumulado, 
      res.valor.Porcentaje_Monto_Mes, res.valor.Porcentaje_Monto_Acumulado];*/
    this.indicadorservice.sendMessageIndicadores([{
      'Monto_Mes':res.valor.Monto_Mes,
      'Monto_Acumulado':res.valor.Monto_Acumulado,
      'P_Monto_Mes':res.valor.Porcentaje_Monto_Mes+"% vs " + res.valor.vs, 
      'P_Monto_Acumulado':res.valor.Porcentaje_Monto_Acumulado+"% vs " + res.valor.vs}]);
    });
}

}

/*const ELEMENT_DATA: IndicadorVentas[] = [
{ mes: , acumulado:103.74, porcentajeMes:'10%' , porcentajeAcumulado: '8%' }

];*/


