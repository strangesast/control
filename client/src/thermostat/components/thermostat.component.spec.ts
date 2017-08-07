import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ThermostatAppComponent } from './thermostat-app.component';

describe('ThermostatAppComponent', () => {
  let component: ThermostatAppComponent;
  let fixture: ComponentFixture<ThermostatAppComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ThermostatAppComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ThermostatAppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
