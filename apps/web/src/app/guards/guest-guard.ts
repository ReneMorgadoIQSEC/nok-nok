import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth';

export const guestGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  authService.restore();
  if (!authService.hasSession()) {
    return true;
  }

  return router.createUrlTree(['/home']);
};
