import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  signal,
} from '@angular/core';
import { RegisterHttpService } from '../../services/register/register-http.service';
import { RegisterDataService } from '../../services/register/register-data.service';
import { DataStep, RegisterSteps } from '../../models/register/steps';
import { Observable } from 'rxjs';
import { ServiceResponse } from '../../models/services';
import { CommonModule } from '@angular/common';
import { InputCode } from '../input-code/input-code';
import { Router } from '@angular/router';

@Component({
  selector: 'app-mail-code',
  imports: [CommonModule, InputCode],
  templateUrl: './mail-code.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MailCode implements OnChanges {
  @Input() open = false;
  @Output() emitCloseDialog = new EventEmitter<void>();
  dataStep = {} as DataStep;
  result$?: Observable<ServiceResponse<any>>;
  code = '';
  allowContinue = false;
  timer = 30;
  expiredTimer = false;
  interval: number | null = null;
  stringTimer = signal<string>('00:00:00');
  verifying = signal(false);
  verifyError = signal<string | null>(null);

  constructor(
    private registerHttpService: RegisterHttpService,
    private registerDataService: RegisterDataService,
    private router: Router,
  ) {
    this.dataStep = this.registerDataService.getStepData<DataStep>(RegisterSteps.DATA);
  }

  closeDialog() {
    this.emitCloseDialog.emit();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['open'] && this.open) {
      this.sendMailCode();
    }
  }

  sendMailCode() {
    this.verifyError.set(null);
    this.result$ = this.registerHttpService.sendMailCode$(this.dataStep.email);
    if (this.interval) {
      clearInterval(this.interval as number);
      this.interval = null;
    }
    this.timer = 30;
    this.startTimer();
  }

  onCode(code: string[]) {
    this.code = code.join('');
    this.allowContinue = true;
    this.verifyError.set(null);
  }

  onBadCode() {
    this.allowContinue = false;
    this.code = '';
  }

  onContinue() {
    if (!this.allowContinue || this.expiredTimer || this.verifying()) {
      return;
    }

    this.verifying.set(true);
    this.verifyError.set(null);

    this.registerHttpService.verifyMailCode$(this.dataStep.email, this.code).subscribe({
      next: (res) => {
        this.verifying.set(false);
        if (!res.success) {
          this.verifyError.set(res.message || 'Código inválido');
          return;
        }

        this.registerDataService.updateCurrentStep(RegisterSteps.PASSKEY, {
          otp: { verified: true, completed: true },
        });
        this.router.navigate(['/register/passkey']);
      },
      error: () => {
        this.verifying.set(false);
        this.verifyError.set('No se pudo verificar el código');
      },
    });
  }

  getTimeFormat() {
    const minutes = Math.floor(this.timer / 60);
    const seconds = this.timer % 60;
    return `00:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  startTimer() {
    this.interval = setInterval(() => {
      this.expiredTimer = false;
      this.timer--;
      this.stringTimer.set(this.getTimeFormat());
      if (this.timer <= 0) {
        clearInterval(this.interval as number);
        this.interval = null;
        this.expiredTimer = true;
        this.stringTimer.set('00:00:00');
      }
    }, 1000);
  }

  resetTimer() {
    this.sendMailCode();
    this.expiredTimer = false;
    this.allowContinue = false;
    this.code = '';
    this.verifyError.set(null);
  }
}
