import { Injectable } from '@angular/core';
import { SessionData } from '../../models/session/session';
import { Router } from '@angular/router';
import { Auth } from '../auth/auth';

@Injectable({
  providedIn: 'root',
})
export class Session {

  constructor(private router: Router, private auth: Auth) {}

  recoverSessionData(): SessionData | null {
    const data = localStorage.getItem('access_token');
    if (!data || data === '' || data === null) {
      this.router.navigate(['/login']);
      this.auth.logout();
      return null;
    }
    return JSON.parse(atob(data)) as SessionData;
  }
}
