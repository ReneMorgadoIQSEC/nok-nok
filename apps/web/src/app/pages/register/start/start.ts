import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ERegisterStep } from '../../../interfaces/IState';
import { StateService } from '../../../services/state';

@Component({
  selector: 'app-register-start',
  imports: [RouterLink],
  templateUrl: './start.html',
})
export class RegisterStart {
  private readonly router = inject(Router);
  private readonly stateService = inject(StateService);

  continue(): void {
    this.stateService.setRegisterStep(ERegisterStep.VerificationCode);
    void this.router.navigate(['/register', ERegisterStep.VerificationCode]);
  }
}
