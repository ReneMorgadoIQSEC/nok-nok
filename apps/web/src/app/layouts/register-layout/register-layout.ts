import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { RegisterDataService } from '../../services/register/register-data.service';
import { Stepper } from "../../components/stepper/stepper";

@Component({
  selector: 'app-register-layout',
  imports: [RouterOutlet, Stepper],
  templateUrl: './register-layout.html'
})
export class RegisterLayout {
  currentStep = 0;
  steps = ['Información personal', 'Código de verificación', 'Passkey', 'Prueba de vida'];
  constructor(private registerDataService: RegisterDataService) {
    this.registerDataService.onStepChange.subscribe((step) => {
      this.currentStep++;
    });
  }
}
