import { Injectable, inject } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { Auth } from '../services/auth/auth';

@Injectable({ providedIn: 'root' })
export class NoAuthGuard implements CanActivate {
  private auth = inject(Auth);
  private router = inject(Router);

  canActivate(): boolean | UrlTree {
    if (!this.auth.isAuthenticated()) return true;
    return this.router.createUrlTree(['/home']);
  }
}
