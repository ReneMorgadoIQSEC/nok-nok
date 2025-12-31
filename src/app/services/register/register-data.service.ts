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
      },
    passkey: {
      example: '',
    },
    otp: {
      verified: false,
    },
    askAntispoofing: {
      chosenAntispoofing: false,
    },
    antispoofing: {
      verified: false,
    },
    currentStep: RegisterSteps.DATA,
  }};

  get state(): RegisterData {
    return this._state$.value;
  }

  resetState() {
    this._state$.next(this.getEmptyState());
  }

  updateCurrentStep(step: RegisterSteps) {
    const newState = { ...this.state, currentStep: step } as RegisterData;
    this._state$.next(newState);
    this.onStepChange.next(step);
  }

  getCurrentStep(): RegisterSteps {
    return this.state.currentStep;
  }

  getStepData(step: RegisterSteps): DataStep | PasskeyStep | OtpStep | AskAntispoofingStep | AntispoofingStep {
    return this.state[step];
  }
}
