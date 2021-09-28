import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompanysInstanceComponent } from './companys-instance.component';

describe('CompanysInstanceComponent', () => {
  let component: CompanysInstanceComponent;
  let fixture: ComponentFixture<CompanysInstanceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CompanysInstanceComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CompanysInstanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
