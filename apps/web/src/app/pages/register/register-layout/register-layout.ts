import { Component, effect, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { ELoginStep, ERegisterStep } from '../../../interfaces/IState';
import { StepIndicator } from '../../../components/step-indicator/step-indicator';
import { StateService } from '../../../services/state';

@Component({
  selector: 'app-register-layout',
  imports: [RouterLink, RouterOutlet, StepIndicator],
  templateUrl: './register-layout.html',
})
export class RegisterLayout {
  private readonly router = inject(Router);
  private readonly stateService = inject(StateService);
  totalSteps = signal<{ label: string, value: ERegisterStep }[]>([
    { label: 'Información de la cuenta', value: ERegisterStep.Start },
    { label: 'Código de verificación', value: ERegisterStep.VerificationCode },
    { label: 'Passkey', value: ERegisterStep.Passkey },
    { label: 'Prueba de vida', value: ERegisterStep.LifeTest },
  ]);

  step = signal<{ label: string, value: ERegisterStep }>(this.totalSteps()[0]);
  
  private readonly effect = effect(() => {
    this.step.set(this.totalSteps().find((step) => step.value === this.stateService.state().registerStep) || this.totalSteps()[0]);
  });

  onCloseButtonClick() {
    void this.router.navigate([ELoginStep.Start]);
  }
}
