import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TopviewSubsectionComponent } from './topview-subsection.component';

describe('TopviewSubsectionComponent', () => {
  let component: TopviewSubsectionComponent;
  let fixture: ComponentFixture<TopviewSubsectionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TopviewSubsectionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TopviewSubsectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
