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

  constructor(private registerDataService: RegisterDataService) {
    this.registerDataService.state$.subscribe((state) => {
      console.log('state', state);
    });
  }

  canActivate(route: ActivatedRouteSnapshot): boolean | UrlTree {
    const current = route.routeConfig?.path as RegisterSteps | undefined;
    if (!current) return true;

    const firstIncomplete = this.getFirstIncompleteStep();
    console.log('firstIncomplete', this.registerDataService.getStepData(RegisterSteps.PASSKEY).completed);
    const currentIndex = REGISTER_STEPS.indexOf(current);
    const allowedIndex = REGISTER_STEPS.indexOf(firstIncomplete);

    if (currentIndex <= allowedIndex) return true;

    return this.router.createUrlTree(['/register', firstIncomplete]);
  }

  private getFirstIncompleteStep(): RegisterSteps {
    if (!this.registerDataService.getStepData(RegisterSteps.DATA).completed) return RegisterSteps.DATA;
    if (!this.registerDataService.getStepData(RegisterSteps.PASSKEY).completed) return RegisterSteps.PASSKEY;
    if (!this.registerDataService.getStepData(RegisterSteps.OTP).completed) return RegisterSteps.OTP;
    if (!this.registerDataService.getStepData(RegisterSteps.ASK_ANTISPOOFING).completed) return RegisterSteps.ASK_ANTISPOOFING;
    if (!this.registerDataService.getStepData(RegisterSteps.ANTISPOOFING).completed) return RegisterSteps.ANTISPOOFING;
    return RegisterSteps.ANTISPOOFING;
  }
}
