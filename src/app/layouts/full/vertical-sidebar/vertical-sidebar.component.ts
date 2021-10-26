import {
  ChangeDetectorRef,
  Component,
  OnDestroy,
  Output,
  EventEmitter,
  Input
} from '@angular/core';
import { PerfectScrollbarConfigInterface } from 'ngx-perfect-scrollbar';
import { MediaMatcher } from '@angular/cdk/layout';
import { MenuItems } from '../../../shared/menu-items/menu-items';
import { GlobalConstants } from '../../../GLOBALS/GlobalConstants';
import { DataIndicador } from 'src/app/models/dataIndicador.interface';
import { UserService } from 'src/app/services/user.service';
import { DataMenu } from 'src/app/models/dataMenu.interface';


@Component({
  selector: 'app-vertical-sidebar',
  templateUrl: './vertical-sidebar.component.html',
  styleUrls: []
})

export class VerticalAppSidebarComponent implements OnDestroy {
  public config: PerfectScrollbarConfigInterface = {};
  mobileQuery: MediaQueryList;
  company:String='COMPANY';

  @Input() showClass: boolean = false;
  @Output() notify: EventEmitter<boolean> = new EventEmitter<boolean>()


  private _mobileQueryListener: () => void;
  status = true;
  showMenu = '';
  itemSelect: number[] = [];
  parentIndex = 0;
  childIndex = 0;

  addExpandClass(element: any) {
    if (element === this.showMenu) {
      this.showMenu = '0';
    } else {
      this.showMenu = element;
    }
  }
  
  subclickEvent(): void {
    this.status = true;
  }
  scrollToTop(): void {
    document.querySelector('.page-wrapper')?.scroll({
      top: 0,
      left: 0
    });
  }

  constructor(
    changeDetectorRef: ChangeDetectorRef,
    media: MediaMatcher,
    public menuItems: MenuItems,
    public userservice: UserService
  ) {
    if(GlobalConstants.listCompanys != undefined){
      this.company=GlobalConstants.listCompanys[0].name;
    }
    
  
    this.mobileQuery = media.matchMedia('(min-width: 768px)');
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    // tslint:disable-next-line: deprecation
    this.mobileQuery.addListener(this._mobileQueryListener);
  }

  ngOnDestroy(): void {
    // tslint:disable-next-line: deprecation
    this.mobileQuery.removeListener(this._mobileQueryListener);
  }

  handleNotify(dato1:any,dato2:any) {
    if(window.innerWidth < 1024){
      this.notify.emit(!this.showClass);
    }
    
    localStorage.removeItem('filtroAMM');
    localStorage.removeItem('menuCT');
    
    const currentMCT: DataMenu = {
      categoriacompaniaid: Number(dato1),
      idtablero: Number(dato2),
    }
    localStorage.setItem('menuCT', JSON.stringify(currentMCT));
    //window.location.reload();
   //localStorage.setItem('filtroAMM', JSON.stringify(currentFiltros));
  //  window.location.reload();
  }
  getTableroSelected(value:any){
   /* GlobalConstants.selectedTablero=value;
    console.log(value);
    console.log(GlobalConstants.selectedTablero);*/
  }


  // aqui_entro(dato1:any,dato2:any) {
  //   alert('cccc');
  //   alert(dato1);
  //   alert(dato2)
  // }

}
