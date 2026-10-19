import { Component, computed, Input, WritableSignal, signal } from '@angular/core';
import { ERegisterStep } from '../../interfaces/IState';

@Component({
  selector: 'app-step-indicator',
  imports: [],
  templateUrl: './step-indicator.html',
})
export class StepIndicator {
  @Input() step: WritableSignal<{ label: string, value: ERegisterStep }> = signal({ label: '', value: ERegisterStep.Start });
  @Input() totalSteps: WritableSignal<{ label: string, value: ERegisterStep }[]> = signal([]);
  completedSteps = computed<{ label: string, value: ERegisterStep }[]>(() => {
    return this.totalSteps().slice(0, this.totalSteps().indexOf(this.step()));
  });

  getStepClass(step: { label: string, value: ERegisterStep }): string {
    if (this.completedSteps().some((completedStep) => completedStep.value === step.value)) {
      return 'step-indicator__step completed';
    }
    if(this.step().value === step.value) {
      return 'step-indicator__step current';
    }
    return 'step-indicator__step';
  }

  getLineClass(step: { label: string, value: ERegisterStep }): string {
    if (this.completedSteps().some((completedStep) => completedStep.value === step.value)) {
      return 'step-indicator__step-line completed';
    }
    return 'step-indicator__step-line';
  }
  
}
