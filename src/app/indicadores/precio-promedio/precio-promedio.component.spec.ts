import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrecioPromedioComponent } from './precio-promedio.component';

describe('PrecioPromedioComponent', () => {
  let component: PrecioPromedioComponent;
  let fixture: ComponentFixture<PrecioPromedioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PrecioPromedioComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PrecioPromedioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
