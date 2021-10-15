import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-tablero',
  templateUrl: './tablero.component.html',
  styleUrls: ['./tablero.component.scss']
})
export class TableroComponent implements OnInit {

  constructor(private ruta:ActivatedRoute,
    private route:Router) {
     //this.route.navigateByUrl('tablero/Cifras_Notables');
       this.ruta.params.subscribe(params=>{
        console.log('parametro '+ params.indicator);
      var dd =   this.route.navigate(['tablero/',params.indicator]);
alert(dd);

       this.route.navigate(['tablero/',params.indicator]);
      //this.tit
    });
   }

  ngOnInit(): void {
  }

}
