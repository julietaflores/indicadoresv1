import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MBTOP5Component } from './mbtop5.component';

describe('MBTOP5Component', () => {
  let component: MBTOP5Component;
  let fixture: ComponentFixture<MBTOP5Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MBTOP5Component ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MBTOP5Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
