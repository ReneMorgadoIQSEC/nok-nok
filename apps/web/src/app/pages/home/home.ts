import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-home',
  templateUrl: './home.html',
})
export class Home {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  logout(): void {
    this.authService.logout();
    void this.router.navigateByUrl('/login');
  }
}
