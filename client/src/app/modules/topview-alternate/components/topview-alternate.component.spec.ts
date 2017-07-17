import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Topview2Component } from './topview-2.component';

describe('Topview2Component', () => {
  let component: Topview2Component;
  let fixture: ComponentFixture<Topview2Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Topview2Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Topview2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
