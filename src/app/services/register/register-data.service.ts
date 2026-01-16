import { Injectable } from '@angular/core';
import { AntispoofingStep, DataStep, PasskeyStep, RegisterData, RegisterSteps, OtpStep, AskAntispoofingStep } from '../../models/register/steps';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class RegisterDataService {

  private _state$ = new BehaviorSubject<RegisterData>(this.getEmptyState());
  state$ = this._state$.asObservable();

  onStepChange = new Subject<RegisterSteps>();

  getEmptyState(): RegisterData {
    return {
      data: {
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        completed: false,
      },
      passkey: {
        completed: false,
      },
      otp: {
        verified: false,
        completed: false,
      },
      askAntispoofing: {
        chosenAntispoofing: false,
        completed: false,
      },
      antispoofing: {
        verified: false,
        completed: false,
      },
      currentStep: RegisterSteps.DATA,
    }
  };

  get state(): RegisterData {
    return this._state$.value;
  }

  resetState() {
    this._state$.next(this.getEmptyState());
  }

  updateCurrentStep(step: RegisterSteps, data?: Record<string, any>) {
    const newState = { ...this.state, currentStep: step, ...data } as RegisterData;
    this._state$.next(newState);
    this.onStepChange.next(step);
  }

  getCurrentStep(): RegisterSteps {
    return this.state.currentStep;
  }

  getStepData<T>(step: RegisterSteps): T {
    return this.state[step as keyof RegisterData] as T;
  }
}
