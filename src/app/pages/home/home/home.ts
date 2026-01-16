import { Component } from '@angular/core';
import { Auth } from '../../../services/auth/auth';
import { Router } from '@angular/router';
import { SessionData } from '../../../models/session/session';
import { Session } from '../../../services/session/session';

@Component({
  selector: 'app-home-component',
  imports: [],
  templateUrl: './home.html'
})
export class HomeComponent {
  sessionData: SessionData | null = null;
  
  constructor(private session: Session) {
    this.sessionData = this.session.recoverSessionData();
  }
}
