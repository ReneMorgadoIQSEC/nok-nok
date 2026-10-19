import { REGISTER_STEPS } from '../interfaces/IState';
import { createStepGuard } from './step-guard';

export const registerStepGuard = createStepGuard({
  steps: REGISTER_STEPS,
  selectStep: (stateService) => stateService.registerStep(),
  toUrl: (step) => `/register/${step}`,
});
