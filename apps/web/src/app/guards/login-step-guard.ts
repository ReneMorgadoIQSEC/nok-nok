import { ELoginStep, LOGIN_STEPS } from '../interfaces/IState';
import { createStepGuard } from './step-guard';

export const loginStepGuard = createStepGuard({
  steps: LOGIN_STEPS,
  selectStep: (stateService) => stateService.loginStep(),
  toUrl: (step) => (step === ELoginStep.Start ? '/login' : `/login/${step}`),
});
