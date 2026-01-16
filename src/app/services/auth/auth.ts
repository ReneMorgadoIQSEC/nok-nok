import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class Auth {
  isAuthenticated(): boolean {
    return !!localStorage.getItem('access_token');
  }

  login(email?: string, password?: string) {
    localStorage.setItem('access_token', '1234567890');
  }

  logout() {
    localStorage.removeItem('access_token');
  }
}
