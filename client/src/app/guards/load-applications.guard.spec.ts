import { TestBed, async, inject } from '@angular/core/testing';

import { LoadApplicationsGuard } from './load-applications.guard';

describe('LoadApplicationsGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [LoadApplicationsGuard]
    });
  });

  it('should ...', inject([LoadApplicationsGuard], (guard: LoadApplicationsGuard) => {
    expect(guard).toBeTruthy();
  }));
});
