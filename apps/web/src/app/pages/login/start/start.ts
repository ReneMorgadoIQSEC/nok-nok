import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { loginIdentityFromResult } from '../../../interfaces/auth';
import { ELoginStep } from '../../../interfaces/IState';
import { registrationErrorMessage } from '../../../interfaces/registration';
import { AuthService } from '../../../services/auth';
import { StateService } from '../../../services/state';

const IDENTITY_ERROR = 'No encontramos una cuenta con ese correo. Verifica el correo e inténtalo de nuevo.';

@Component({
  selector: 'app-login-start',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './start.html',
})
export class LoginStart {
  private readonly router = inject(Router);
  private readonly stateService = inject(StateService);
  private readonly authService = inject(AuthService);
  private submitting = false;

  form = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
  });

  emailError(): string | null {
    const email = this.form.controls.email;
    if (!email.touched) {
      return null;
    }
    if (email.hasError('required')) {
      return 'Ingresa un correo electrónico';
    }
    if (email.hasError('email')) {
      return 'Ingresa un correo electrónico válido';
    }
    return null;
  }

  onSubmit(): void {
    if (this.form.invalid || this.submitting) {
      return;
    }

    const email = this.form.controls.email.value?.trim() ?? '';
    this.submitting = true;
    this.showLoaderModal('Buscando tu cuenta');
    this.authService.getIdentityByEmail(email).subscribe({
      next: (result) => this.handleIdentityResult(result, email),
      error: (error: unknown) =>
        this.handleIdentityResult(error instanceof HttpErrorResponse ? error.error : error, email),
    });
  }

  private handleIdentityResult(payload: unknown, email: string) {
    const message = this.identityErrorMessage(payload);
    const identity = loginIdentityFromResult(payload);
    if (message || !identity) {
      this.submitting = false;
      this.showErrorModal(message ?? IDENTITY_ERROR, 'Reintentar', () => this.onSubmit());
      return;
    }

    this.stateService.setEmail(email);
    this.stateService.setIdentity(identity.identityId, identity.deviceId);
    this.stateService.setLoginStep(ELoginStep.Password);
    this.submitting = false;
    this.hideLoaderModal();
    void this.router.navigate(['/login', ELoginStep.Password]);
  }

  private identityErrorMessage(payload: unknown): string | null {
    const message = registrationErrorMessage(payload, IDENTITY_ERROR);
    if (message && /sequence contains no elements/i.test(message)) {
      return IDENTITY_ERROR;
    }
    return message;
  }

  private hideLoaderModal() {
    this.stateService.setModalData({
      show: false,
    });
  }

  private showLoaderModal(title: string) {
    this.stateService.setModalData({
      show: true,
      imageSize: 'small',
      title,
      description: 'Espera un momento, por favor...',
      image: 'images/loader.gif',
    });
  }

  private showErrorModal(description: string, buttonText: string, buttonAction: () => void) {
    this.stateService.setModalData({
      show: true,
      imageSize: 'large',
      title: 'Algo salió mal',
      description,
      image: 'images/error.svg',
      buttonText,
      closeable: true,
      buttonAction,
    });
  }
}
