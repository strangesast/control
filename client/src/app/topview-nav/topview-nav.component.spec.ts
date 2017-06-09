import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TopviewNavComponent } from './topview-nav.component';

describe('TopviewNavComponent', () => {
  let component: TopviewNavComponent;
  let fixture: ComponentFixture<TopviewNavComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TopviewNavComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TopviewNavComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
