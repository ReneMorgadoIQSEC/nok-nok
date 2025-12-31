import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, UrlTree } from '@angular/router';
import { RegisterDataService } from '../services/register/register-data.service';
import { RegisterSteps } from '../models/register/steps';

const REGISTER_STEPS: RegisterSteps[] = [
  RegisterSteps.DATA,
  RegisterSteps.PASSKEY,
  RegisterSteps.OTP,
  RegisterSteps.ASK_ANTISPOOFING,
  RegisterSteps.ANTISPOOFING,
];

@Injectable({ providedIn: 'root' })
export class RegisterStepGuard implements CanActivate {
  private router = inject(Router);
  private flow = inject(RegisterDataService);

  canActivate(route: ActivatedRouteSnapshot): boolean | UrlTree {
    const current = route.routeConfig?.path as RegisterSteps | undefined;
    if (!current) return true;

    const firstIncomplete = this.getFirstIncompleteStep();
    const currentIndex = REGISTER_STEPS.indexOf(current);
    const allowedIndex = REGISTER_STEPS.indexOf(firstIncomplete);

    if (currentIndex <= allowedIndex) return true;

    return this.router.createUrlTree(['/register', firstIncomplete]);
  }

  private getFirstIncompleteStep(): RegisterSteps {
    if (!this.flow.getStepData(RegisterSteps.DATA)) return RegisterSteps.DATA;
    if (!this.flow.getStepData(RegisterSteps.PASSKEY)) return RegisterSteps.PASSKEY;
    if (!this.flow.getStepData(RegisterSteps.OTP)) return RegisterSteps.OTP;
    if (!this.flow.getStepData(RegisterSteps.ASK_ANTISPOOFING)) return RegisterSteps.ASK_ANTISPOOFING;
    if (!this.flow.getStepData(RegisterSteps.ANTISPOOFING)) return RegisterSteps.ANTISPOOFING;
    return RegisterSteps.ANTISPOOFING;
  }
}
