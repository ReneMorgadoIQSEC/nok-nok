import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { EAuthenticatedPages } from '../../../interfaces/IState';
import { registrationErrorMessage } from '../../../interfaces/registration';
import { AuthService } from '../../../services/auth';
import { StateService } from '../../../services/state';

const LOGIN_ERROR = 'No logramos iniciar tu sesión. Por favor, vuelve a intentarlo.';
const ACCOUNT_ERROR = 'No encontramos los datos de tu cuenta. Vuelve al inicio e inténtalo de nuevo.';

@Component({
  selector: 'app-password',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './password.html',
})
export class Password {
  private readonly router = inject(Router);
  private readonly stateService = inject(StateService);
  private readonly authService = inject(AuthService);
  private submitting = false;

  readonly form = new FormGroup({
    password: new FormControl('', [Validators.required, Validators.minLength(8)]),
  });

  passwordError(): string | null {
    const password = this.form.controls.password;
    if (!password.touched) {
      return null;
    }
    if (password.hasError('required')) {
      return 'Ingresa una contraseña';
    }
    if (password.hasError('minlength')) {
      return 'La contraseña debe tener al menos 8 caracteres';
    }
    return null;
  }

  onSubmit(): void {
    if (this.form.invalid || this.submitting) {
      return;
    }

    const identityId = this.stateService.state().identityId;
    const password = this.form.controls.password.value ?? '';
    if (!identityId) {
      this.showErrorModal(ACCOUNT_ERROR, 'Aceptar', () => this.hideLoaderModal());
      return;
    }

    this.submitting = true;
    this.showLoaderModal('Iniciando sesión');
    this.authService.login(identityId, password).subscribe({
      next: (result) => this.handleLoginResult(result),
      error: (error: unknown) =>
        this.handleLoginResult(error instanceof HttpErrorResponse ? error.error : error),
    });
  }

  private handleLoginResult(payload: unknown) {
    const message = registrationErrorMessage(payload, LOGIN_ERROR);
    if (message || !this.authService.saveSession(payload)) {
      this.submitting = false;
      this.showErrorModal(message ?? LOGIN_ERROR, 'Reintentar', () => this.onSubmit());
      return;
    }

    this.submitting = false;
    this.hideLoaderModal();
    void this.router.navigate([EAuthenticatedPages.Home]);
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
