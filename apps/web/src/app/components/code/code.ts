import { Component, computed, Input, Output, EventEmitter, signal, OnInit, OnDestroy } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-code',
  imports: [ReactiveFormsModule],
  templateUrl: './code.html',
})
export class Code implements OnInit, OnDestroy {
  @Input() show: boolean = false;
  @Output() onClose: EventEmitter<void> = new EventEmitter<void>();
  @Output() onVerify: EventEmitter<string> = new EventEmitter<string>();
  @Output() onResend: EventEmitter<void> = new EventEmitter<void>();

  codeExpiresIn = 120;
  codeRemainingTime = signal(this.codeExpiresIn);
  formattedCodeRemainingTime = computed(() => {
    const minutes = Math.floor(this.codeRemainingTime() / 60).toString().padStart(2, '0');
    const seconds = (this.codeRemainingTime() % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  });

  private countdownId: ReturnType<typeof setInterval> | undefined;

  countdownTimer() {
    this.stopCountdown();
    this.countdownId = setInterval(() => {
      const next = this.codeRemainingTime() - 1;
      this.codeRemainingTime.set(Math.max(next, 0));
      if (next <= 0) {
        this.stopCountdown();
      }
    }, 1000);
  }

  private stopCountdown() {
    if (this.countdownId !== undefined) {
      clearInterval(this.countdownId);
      this.countdownId = undefined;
    }
  }

  private resetCountdown() {
    this.codeRemainingTime.set(this.codeExpiresIn);
    this.countdownTimer();
  }

  ngOnInit() {
    this.resetCountdown();
  }

  ngOnDestroy() {
    this.stopCountdown();
  }

  codeForm = new FormGroup({
    digit1: new FormControl('', [Validators.required, Validators.minLength(1), Validators.maxLength(1)]),
    digit2: new FormControl('', [Validators.required, Validators.minLength(1), Validators.maxLength(1)]),
    digit3: new FormControl('', [Validators.required, Validators.minLength(1), Validators.maxLength(1)]),
    digit4: new FormControl('', [Validators.required, Validators.minLength(1), Validators.maxLength(1)]),
    digit5: new FormControl('', [Validators.required, Validators.minLength(1), Validators.maxLength(1)]),
    digit6: new FormControl('', [Validators.required, Validators.minLength(1), Validators.maxLength(1)]),
  });

  resendCode() {
    this.resetCountdown();
    this.onResend.emit();
  }

  verifyCode() {
    const code = Object.values(this.codeForm.value).join('');
    this.onVerify.emit(code);
  }

  closeModal() {
    this.onClose.emit();
  }
}
