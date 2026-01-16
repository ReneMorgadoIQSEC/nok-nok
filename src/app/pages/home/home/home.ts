import { Component } from '@angular/core';
import { Auth } from '../../../services/auth/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home-component',
  imports: [],
  templateUrl: './home.html'
})
export class HomeComponent {

  constructor(private auth: Auth, private router: Router) {
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
