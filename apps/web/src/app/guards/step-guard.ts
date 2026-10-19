import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { StateService } from '../services/state';

export function createStepGuard<T extends string>(options: {
  steps: readonly T[];
  selectStep: (stateService: StateService) => T;
  toUrl: (step: T) => string;
}): CanActivateFn {
  return (route) => {
    const router = inject(Router);
    const stateService = inject(StateService);
    const target = route.data['step'] as T | undefined;

    if (!target) return true;

    const current = options.selectStep(stateService);
    const targetIndex = options.steps.indexOf(target);
    const currentIndex = options.steps.indexOf(current);

    if (targetIndex < 0 || currentIndex < 0 || targetIndex <= currentIndex) return true;

    return router.parseUrl(options.toUrl(current));
  };
}
