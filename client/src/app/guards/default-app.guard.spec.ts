import { TestBed, async, inject } from '@angular/core/testing';

import { DefaultAppGuard } from './default-app.guard';

describe('DefaultAppGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DefaultAppGuard]
    });
  });

  it('should ...', inject([DefaultAppGuard], (guard: DefaultAppGuard) => {
    expect(guard).toBeTruthy();
  }));
});
