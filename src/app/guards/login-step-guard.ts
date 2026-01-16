import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, UrlTree } from '@angular/router';
import { LoginSteps, PasswordStep, StartStep } from '../models/login/steps';
import { LoginDataService } from '../services/login/login-data.service';

const LOGIN_STEPS: LoginSteps[] = [
  LoginSteps.START,
  LoginSteps.PASSWORD,
];

@Injectable({ providedIn: 'root' })
export class LoginStepGuard implements CanActivate {
  private router = inject(Router);

  constructor(private loginDataService: LoginDataService) {}

  canActivate(route: ActivatedRouteSnapshot): boolean | UrlTree {
    const current = route.routeConfig?.path as LoginSteps | undefined;
    if (!current) return true;
    const firstIncomplete = this.getFirstIncompleteStep();
    const currentIndex = LOGIN_STEPS.indexOf(current);
    const allowedIndex = LOGIN_STEPS.indexOf(firstIncomplete);
    if (currentIndex <= allowedIndex) return true;
    return this.router.createUrlTree(['/login', firstIncomplete]);
  }

  private getFirstIncompleteStep(): LoginSteps {
    if (!this.loginDataService.getStepData<StartStep>(LoginSteps.START).completed) return LoginSteps.START;
    if (!this.loginDataService.getStepData<PasswordStep>(LoginSteps.PASSWORD).completed) return LoginSteps.PASSWORD;
    return LoginSteps.PASSWORD;
  }
}
