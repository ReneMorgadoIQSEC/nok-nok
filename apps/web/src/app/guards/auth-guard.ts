import { Injectable, inject } from '@angular/core';
import { CanActivateChild, Router, UrlTree } from '@angular/router';
import { Auth } from '../services/auth/auth';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivateChild {
  private auth = inject(Auth);
  private router = inject(Router);

  canActivateChild(): boolean | UrlTree {
    if (this.auth.isAuthenticated()) return true;
    return this.router.createUrlTree(['/login']);
  }
}
