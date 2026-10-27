import { Component, inject, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { AuthService } from '../../services/auth';
import { Modal } from '../../components/modal/modal';
import { Header } from '../../components/header/header';
import { Navbar } from '../../components/navbar/navbar';

@Component({
  selector: 'app-home',
  templateUrl: './home.html',
  imports: [Header, Navbar, RouterOutlet, Modal],
})
export class Home {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  showNavbar = signal(false);

  logout(): void {
    this.authService.logout();
    void this.router.navigateByUrl('/login');
  }
}
