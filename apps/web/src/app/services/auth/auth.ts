import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
@Injectable({ providedIn: 'root' })
export class Auth {
  constructor(private router: Router) {}

  isAuthenticated(): boolean {
    return !!localStorage.getItem('access_token');
  }

  login(email?: string, password?: string) {
    const randomToken = Math.random().toString(36).substring(2, 15);
    const data = {
      name: "René Morgado",
      email: email,
      token: randomToken,
    };
    localStorage.setItem('access_token', btoa(JSON.stringify(data)));
    return randomToken;
  }

  logout() {
    localStorage.removeItem('access_token');
    this.router.navigate(['/login']);
  }
}
