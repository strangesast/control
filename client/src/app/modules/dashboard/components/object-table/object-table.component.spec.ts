import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ObjectTableComponent } from './object-table.component';

describe('ObjectTableComponent', () => {
  let component: ObjectTableComponent;
  let fixture: ComponentFixture<ObjectTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ObjectTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ObjectTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
