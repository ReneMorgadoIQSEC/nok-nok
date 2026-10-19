import { computed, Injectable, signal } from '@angular/core';
import { ELoginStep, ERegisterStep, State } from '../interfaces/IState';

@Injectable({
  providedIn: 'root',
})
export class StateService {
  state = signal<State>(this.getEmptyState());

  registerStep = computed(() => this.state().registerStep);
  loginStep = computed(() => this.state().loginStep);
  authenticated = computed(() => this.state().authenticated);

  private getEmptyState(): State {
    return {
      registerStep: ERegisterStep.Start,
      loginStep: ELoginStep.Start,
      authenticated: false,
    };
  }

  setRegisterStep(step: ERegisterStep) {
    this.state.update((state) => ({ ...state, registerStep: step }));
  }

  setLoginStep(step: ELoginStep) {
    this.state.update((state) => ({ ...state, loginStep: step }));
  }

  setAuthenticated(authenticated: boolean) {
    this.state.update((state) => ({ ...state, authenticated }));
  }

  resetState() {
    this.state.set(this.getEmptyState());
  }
}
