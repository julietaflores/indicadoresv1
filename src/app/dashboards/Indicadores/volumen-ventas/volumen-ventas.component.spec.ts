import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VolumenVentasComponent } from './volumen-ventas.component';

describe('VolumenVentasComponent', () => {
  let component: VolumenVentasComponent;
  let fixture: ComponentFixture<VolumenVentasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VolumenVentasComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VolumenVentasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
