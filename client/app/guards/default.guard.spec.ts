import { TestBed, async, inject } from '@angular/core/testing';

import { DefaultGuard } from './default.guard';

describe('DefaultGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DefaultGuard]
    });
  });

  it('should ...', inject([DefaultGuard], (guard: DefaultGuard) => {
    expect(guard).toBeTruthy();
  }));
});
