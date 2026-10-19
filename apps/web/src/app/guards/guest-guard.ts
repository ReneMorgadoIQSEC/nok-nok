import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { StateService } from '../services/state';

export const guestGuard: CanActivateFn = () => {
  const stateService = inject(StateService);
  const router = inject(Router);

  if (!stateService.authenticated()) return true;

  return router.createUrlTree(['/home']);
};
