import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoinsInstanceComponent } from './coins-instance.component';

describe('CoinsInstanceComponent', () => {
  let component: CoinsInstanceComponent;
  let fixture: ComponentFixture<CoinsInstanceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CoinsInstanceComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CoinsInstanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
