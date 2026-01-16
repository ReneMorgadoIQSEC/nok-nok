import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { LoginData } from '../../models/login/steps';
import { LoginSteps } from '../../models/login/steps';

@Injectable({ providedIn: 'root' })
export class LoginDataService {

  private _state$ = new BehaviorSubject<LoginData>(this.getEmptyState());
  state$ = this._state$.asObservable();

  onStepChange = new Subject<LoginSteps>();
  onPhoneLogin = new Subject<string>();

  getEmptyState(): LoginData {
    return {
      start: {
        email: '',
        completed: false,
      },
      password: {
        password: '',
        completed: false,
      },
      currentStep: LoginSteps.START,
    }
  };

  get state(): LoginData {
    return this._state$.value;
  }

  resetState() {
    this._state$.next(this.getEmptyState());
  }

  updateCurrentStep(step: LoginSteps, data?: Record<string, any>) {
    const newState = { ...this.state, currentStep: step, ...data } as LoginData;
    this._state$.next(newState);
    this.onStepChange.next(step);
  }

  triggerPhoneLogin(email: string) {
    if (!this.state.start.completed) return;
    this.onPhoneLogin.next(email);
  }

  getCurrentStep(): LoginSteps {
    return this.state.currentStep;
  }

  getStepData<T>(step: LoginSteps): T {
    return this.state[step as keyof LoginData] as T;
  }
}
