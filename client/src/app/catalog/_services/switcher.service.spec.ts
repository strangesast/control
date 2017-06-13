import { TestBed, inject } from '@angular/core/testing';

import { SwitcherService } from './switcher.service';

describe('SwitcherService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SwitcherService]
    });
  });

  it('should be created', inject([SwitcherService], (service: SwitcherService) => {
    expect(service).toBeTruthy();
  }));
});
