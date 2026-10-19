import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { loginStepGuard } from './login-step-guard';

describe('loginStepGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => loginStepGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
