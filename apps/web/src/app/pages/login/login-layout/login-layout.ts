import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { Modal } from '../../../components/modal/modal';
import { passkeyLoginOptionsFromResult } from '../../../interfaces/auth';
import { EAuthenticatedPages, ELoginStep } from '../../../interfaces/IState';
import { registrationErrorMessage } from '../../../interfaces/registration';
import { AuthService } from '../../../services/auth';
import { StateService } from '../../../services/state';
import {
  passkeyLoginExceptionMessage,
  serializeAssertion,
  toRequestOptions,
} from '../../../services/webauthn';

const OPTIONS_ERROR = 'No logramos preparar el passkey. Por favor, vuelve a intentarlo.';
const VALIDATE_ERROR = 'No logramos validar el passkey. Por favor, vuelve a intentarlo.';
const ACCOUNT_ERROR = 'No encontramos los datos de tu cuenta. Vuelve al inicio e inténtalo de nuevo.';
const UNSUPPORTED_ERROR = 'Este navegador no puede iniciar sesión con passkey.';

@Component({
  selector: 'app-login-layout',
  imports: [RouterOutlet, RouterLink, Modal],
  templateUrl: './login-layout.html',
})
export class LoginLayout {
  readonly stateService = inject(StateService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  readonly ELoginStep = ELoginStep;
  private pending = false;

  onPasskeyClick(): void {
    if (this.pending) {
      return;
    }

    const state = this.stateService.state();
    if (!state.identityId || !state.email) {
      this.showErrorModal(ACCOUNT_ERROR, 'Aceptar', () => this.hideModal());
      return;
    }
    if (!window.PublicKeyCredential || !window.isSecureContext) {
      this.showErrorModal(UNSUPPORTED_ERROR, 'Aceptar', () => this.hideModal());
      return;
    }

    this.pending = true;
    this.showLoaderModal('Iniciando sesión con passkey');
    this.authService
      .passkeyLoginOptions({
        identityId: state.identityId,
        email: state.email,
      })
      .subscribe({
        next: (result) => void this.requestCredential(result),
        error: (error: unknown) => this.fail(this.errorPayload(error), OPTIONS_ERROR),
      });
  }

  private async requestCredential(payload: unknown) {
    const message = registrationErrorMessage(payload, OPTIONS_ERROR);
    const options = passkeyLoginOptionsFromResult(payload);
    if (message || !options) {
      this.fail(message ?? OPTIONS_ERROR);
      return;
    }

    try {
      const credential = await navigator.credentials.get({
        publicKey: toRequestOptions(options),
      });
      if (!(credential instanceof PublicKeyCredential)) {
        this.fail('No se obtuvo el passkey. Vuelve a intentarlo.');
        return;
      }

      this.authService
        .validatePasskey({
          credential: serializeAssertion(credential),
          challenge: options.challenge,
          identityId: options.identityId || this.stateService.state().identityId,
        })
        .subscribe({
          next: (result) => this.handleValidateResult(result),
          error: (error: unknown) => this.fail(this.errorPayload(error), VALIDATE_ERROR),
        });
    } catch (error) {
      this.fail(passkeyLoginExceptionMessage(error));
    }
  }

  private handleValidateResult(payload: unknown) {
    const message = registrationErrorMessage(payload, VALIDATE_ERROR);
    if (message || !this.authService.saveSession(payload)) {
      this.fail(message ?? VALIDATE_ERROR);
      return;
    }

    this.pending = false;
    this.hideModal();
    void this.router.navigate([EAuthenticatedPages.Home]);
  }

  private fail(payload: unknown, fallback = VALIDATE_ERROR) {
    this.pending = false;
    const description =
      typeof payload === 'string' ? payload : registrationErrorMessage(payload, fallback);
    this.showErrorModal(description ?? fallback, 'Reintentar', () => this.onPasskeyClick());
  }

  private errorPayload(error: unknown) {
    return error instanceof HttpErrorResponse ? error.error : error;
  }

  private hideModal() {
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
