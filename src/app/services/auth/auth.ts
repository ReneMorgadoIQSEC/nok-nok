import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class Auth {
  // Cámbialo por tu lógica real (token, cookie, session, etc.)
  isAuthenticated(): boolean {
    return !!localStorage.getItem('access_token');
  }
}
