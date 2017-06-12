import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EnergyProfileComponent } from './energy-profile.component';

describe('EnergyProfileComponent', () => {
  let component: EnergyProfileComponent;
  let fixture: ComponentFixture<EnergyProfileComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EnergyProfileComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EnergyProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
