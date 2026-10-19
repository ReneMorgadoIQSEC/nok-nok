import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ELoginStep } from '../../../interfaces/IState';
import { StateService } from '../../../services/state';

@Component({
  selector: 'app-login-start',
  imports: [RouterLink],
  templateUrl: './start.html',
})
export class LoginStart {
  private readonly router = inject(Router);
  private readonly stateService = inject(StateService);

  continue(): void {
    if (this.stateService.loginStep() === ELoginStep.Start) {
      this.stateService.setLoginStep(ELoginStep.Password);
    }

    void this.router.navigate(['/login', ELoginStep.Password]);
  }
}
