import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import {
  passkeyOptionsFromResult,
  registrationErrorMessage,
} from '../../../interfaces/registration';
import { RegistrationService } from '../../../services/registration';
import { StateService } from '../../../services/state';
import {
  passkeyExceptionMessage,
  serializeNewCredential,
  toCreationOptions,
} from '../../../services/webauthn';

const OPTIONS_ERROR = 'No logramos preparar el passkey. Por favor, vuelve a intentarlo.';
const REGISTER_ERROR = 'No logramos registrar el passkey. Por favor, vuelve a intentarlo.';
const ACCOUNT_ERROR = 'No encontramos los datos de tu registro. Vuelve al inicio e inténtalo de nuevo.';
const UNSUPPORTED_ERROR = 'Este navegador no puede crear un passkey.';

@Component({
  selector: 'app-passkey',
  imports: [],
  templateUrl: './passkey.html',
})
export class Passkey {
  private readonly stateService = inject(StateService);
  private readonly registrationService = inject(RegistrationService);
  private pending = false;
  private created = false;

  startPasskeyRegistration() {
    if (this.pending) {
      return;
    }
    if (this.created) {
      this.showSuccessModal();
      return;
    }

    const state = this.stateService.state();
    if (!state.identityId || !state.email || !state.fullName) {
      this.showErrorModal(ACCOUNT_ERROR, 'Aceptar', () => this.hideLoaderModal());
      return;
    }
    if (!window.PublicKeyCredential || !window.isSecureContext) {
      this.showErrorModal(UNSUPPORTED_ERROR, 'Aceptar', () => this.hideLoaderModal());
      return;
    }

    this.pending = true;
    this.showLoaderModal('Creando Passkey');
    this.registrationService
      .passkeyOptions({
        identityId: state.identityId,
        email: state.email,
        displayName: state.fullName,
      })
      .subscribe({
        next: (result) => void this.createCredential(result),
        error: (error: unknown) => this.fail(this.errorPayload(error), OPTIONS_ERROR),
      });
  }

  private async createCredential(payload: unknown) {
    const message = registrationErrorMessage(payload, OPTIONS_ERROR);
    const options = passkeyOptionsFromResult(payload);
    if (message || !options) {
      this.fail(message ?? OPTIONS_ERROR);
      return;
    }

    try {
      const credential = await navigator.credentials.create({
        publicKey: toCreationOptions(options),
      });
      if (!(credential instanceof PublicKeyCredential)) {
        this.fail('No se creó el passkey. Vuelve a intentarlo.');
        return;
      }

      this.registrationService
        .registerPasskey({
          credential: serializeNewCredential(credential),
          challenge: options.challenge,
          identityId: options.identityId || this.stateService.state().identityId,
        })
        .subscribe({
          next: (result) => this.handleRegisterResult(result),
          error: (error: unknown) => this.fail(this.errorPayload(error), REGISTER_ERROR),
        });
    } catch (error) {
      this.fail(passkeyExceptionMessage(error));
    }
  }

  private handleRegisterResult(payload: unknown) {
    const message = registrationErrorMessage(payload, REGISTER_ERROR);
    if (message) {
      this.fail(message);
      return;
    }

    this.pending = false;
    this.created = true;
    this.showSuccessModal();
  }

  private fail(payload: unknown, fallback = REGISTER_ERROR) {
    this.pending = false;
    const description = typeof payload === 'string' ? payload : registrationErrorMessage(payload, fallback);
    this.showErrorModal(description ?? fallback, 'Reintentar', () => this.startPasskeyRegistration());
  }

  private errorPayload(error: unknown) {
    return error instanceof HttpErrorResponse ? error.error : error;
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

  private showSuccessModal() {
    this.stateService.setModalData({
      show: true,
      imageSize: 'large',
      title: 'Passkey creado',
      description: 'Tu passkey quedó vinculado a este dispositivo.',
      image: 'images/check.svg',
      buttonText: 'Aceptar',
      closeable: true,
      buttonAction: () => this.hideLoaderModal(),
    });
  }
}
