import { Component, signal } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { Session } from '../../services/session/session';
import { SessionData } from '../../models/session/session';
import { CommonModule } from '@angular/common';
import { Auth } from '../../services/auth/auth';

@Component({
  selector: 'app-app-shell-layout',
  imports: [RouterOutlet, RouterLink, CommonModule],
  templateUrl: './app-shell-layout.html',
})
export class AppShellLayout {
  sessionData: SessionData | null = null;
  isActive = (path: string) => this.router.url === path;
  showNavbar = signal(false);

  constructor(private session: Session, private router: Router, private auth: Auth) {
    this.sessionData = this.session.recoverSessionData() || null;
  }

  logout() {
    this.auth.logout();
  }

}
