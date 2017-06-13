import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SwitcherComponentComponent } from './switcher-component.component';

describe('SwitcherComponentComponent', () => {
  let component: SwitcherComponentComponent;
  let fixture: ComponentFixture<SwitcherComponentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SwitcherComponentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SwitcherComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
