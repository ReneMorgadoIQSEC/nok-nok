import { computed, Injectable, signal } from '@angular/core';
import { ELoginStep, ERegisterStep, ModalData, State } from '../interfaces/IState';

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
      modalData: null,
      email: '',
      fullName: '',
      phoneNumber: '',
      password: '',
      identityId: '',
      deviceId: '',
      userId: '',
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

  setEmail(email: string) {
    this.state.update((state) => ({ ...state, email }));
  }

  setAccount(account: { fullName: string; email: string; phoneNumber: string; password: string }) {
    this.state.update((state) => ({ ...state, ...account }));
  }

  setIdentity(identityId: string, deviceId: string) {
    this.state.update((state) => ({ ...state, identityId, deviceId }));
  }

  setUserId(userId: string) {
    this.state.update((state) => ({ ...state, userId }));
  }

  clearPassword() {
    this.state.update((state) => ({ ...state, password: '' }));
  }

  setModalData(modalData: ModalData | null) {
    this.state.update((state) => ({ ...state, modalData }));
  }

  resetState() {
    this.state.set(this.getEmptyState());
  }
}
