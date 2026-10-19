import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { StateService } from '../../services/state';

@Component({
  selector: 'app-home',
  templateUrl: './home.html',
})
export class Home {
  private readonly router = inject(Router);
  private readonly stateService = inject(StateService);

  logout(): void {
    this.stateService.resetState();
    void this.router.navigateByUrl('/login');
  }
}
