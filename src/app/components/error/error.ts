import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-error',
  imports: [],
  templateUrl: './error.html',
})
export class Error {
  @Input() showError = false;
  @Input() title = 'Error';
  @Input() message = '';
  @Input() image = 'images/unplug.svg';
  @Input() buttonText = 'Cerrar';
  @Input() attempts = 0;

  @Output() closeDialog = new EventEmitter<void>();

  attemptsMade: number = 0;

  constructor(private router: Router) {}

  emitCloseDialog() {
    this.closeDialog.emit();
  }

  onContinue() {
    this.attemptsMade++;
    if (this.attemptsMade > this.attempts) {
      this.router.navigate(['/register']);
    } else {
      this.emitCloseDialog();
    }
  }
}
