import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { RegisterDataService } from '../../../services/register/register-data.service';
import { RegisterSteps } from '../../../models/register/steps';
import { Auth } from '../../../services/auth/auth';

@Component({
  selector: 'app-ask-antispoofing-component',
  imports: [],
  templateUrl: './ask-antispoofing.html'
})
export class AskAntispoofingComponent {

  selectedAntispoofing: boolean = true;

  constructor(private router: Router, private registerDataService: RegisterDataService, private auth: Auth) {
  }

  selectOption(option: boolean) {
    this.selectedAntispoofing = option;
  }

  onSkip() {
    this.registerDataService.updateCurrentStep(RegisterSteps.ANTISPOOFING, { chosenAntispoofing: false, completed: true });
    this.auth.login(this.registerDataService.state.data.email, this.registerDataService.state.data.password);
    this.router.navigate(['/home']);
  }

  onContinue() {
    if (this.selectedAntispoofing) {
      this.registerDataService.updateCurrentStep(RegisterSteps.ANTISPOOFING, { chosenAntispoofing: true, completed: true });
      this.router.navigate(['/register/antispoofing']);
    } else {
      this.onSkip();
    }
  }
}
