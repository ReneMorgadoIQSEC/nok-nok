import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-stepper',
  imports: [CommonModule],
  templateUrl: './stepper.html'
})
export class Stepper {
  @Input() steps: string[] = [];
  @Input() currentStep = 0;

}
