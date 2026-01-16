import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, UrlTree } from '@angular/router';
import { RegisterDataService } from '../services/register/register-data.service';
import { AskAntispoofingStep, AntispoofingStep, RegisterSteps } from '../models/register/steps';
import { PasskeyStep } from '../models/register/steps';
import { DataStep } from '../models/register/steps';
import { OtpStep } from '../models/register/steps';

const REGISTER_STEPS: RegisterSteps[] = [
  RegisterSteps.DATA,
  RegisterSteps.OTP,
  RegisterSteps.PASSKEY,
  RegisterSteps.ASK_ANTISPOOFING,
  RegisterSteps.ANTISPOOFING,
];

@Injectable({ providedIn: 'root' })
export class RegisterStepGuard implements CanActivate {
  private router = inject(Router);

  constructor(private registerDataService: RegisterDataService) {
    this.registerDataService.state$.subscribe((state) => {
      console.log('state', state);
    });
  }

  canActivate(route: ActivatedRouteSnapshot): boolean | UrlTree {
    const current = route.routeConfig?.path as RegisterSteps | undefined;
    if (!current) return true;

    const firstIncomplete = this.getFirstIncompleteStep();
    console.log('firstIncomplete', this.registerDataService.getStepData<PasskeyStep>(RegisterSteps.PASSKEY).completed);
    const currentIndex = REGISTER_STEPS.indexOf(current);
    const allowedIndex = REGISTER_STEPS.indexOf(firstIncomplete);

    if (currentIndex <= allowedIndex) return true;

    return this.router.createUrlTree(['/register', firstIncomplete]);
  }

  private getFirstIncompleteStep(): RegisterSteps {
    if (!this.registerDataService.getStepData<DataStep>(RegisterSteps.DATA).completed) return RegisterSteps.DATA;
    if (!this.registerDataService.getStepData<OtpStep>(RegisterSteps.OTP).completed) return RegisterSteps.OTP;
    if (!this.registerDataService.getStepData<PasskeyStep>(RegisterSteps.PASSKEY).completed) return RegisterSteps.PASSKEY;
    if (!this.registerDataService.getStepData<AskAntispoofingStep> (RegisterSteps.ASK_ANTISPOOFING).completed) return RegisterSteps.ASK_ANTISPOOFING;
    if (!this.registerDataService.getStepData<AntispoofingStep> (RegisterSteps.ANTISPOOFING).completed) return RegisterSteps.ANTISPOOFING;
    return RegisterSteps.ANTISPOOFING;
  }
}
