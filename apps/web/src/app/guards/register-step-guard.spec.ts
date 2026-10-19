import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { registerStepGuard } from './register-step-guard';

describe('registerStepGuardGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => registerStepGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
