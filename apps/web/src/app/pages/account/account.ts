import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import {
  credentialsFromResult,
  StoredCredential,
} from '../../interfaces/auth';
import { passkeyOptionsFromResult, registrationErrorMessage } from '../../interfaces/registration';
import { AuthService } from '../../services/auth';
import { RegistrationService } from '../../services/registration';
import { StateService } from '../../services/state';
import {
  passkeyExceptionMessage,
  serializeNewCredential,
  toCreationOptions,
} from '../../services/webauthn';

const CREDENTIALS_ERROR = 'No logramos consultar tus métodos de inicio de sesión.';
const OPTIONS_ERROR = 'No logramos preparar el passkey. Por favor, vuelve a intentarlo.';
const REGISTER_ERROR = 'No logramos registrar el passkey. Por favor, vuelve a intentarlo.';
const DELETE_ERROR = 'No logramos eliminar el passkey. Por favor, vuelve a intentarlo.';
const ACCOUNT_ERROR = 'No encontramos los datos de tu sesión. Vuelve a iniciar sesión e inténtalo de nuevo.';
const UNSUPPORTED_ERROR = 'Este navegador no puede crear un passkey.';
const PASSKEY_DISPLAY_NAME = 'Usuario';

@Component({
  selector: 'app-account',
  imports: [],
  templateUrl: './account.html',
})
export class Account {
  private readonly authService = inject(AuthService);
  private readonly registrationService = inject(RegistrationService);
  private readonly stateService = inject(StateService);
  private credentials: StoredCredential[] = [];

  readonly loading = signal(true);
  readonly busy = signal(false);
  readonly passkeyEnabled = signal(false);

  constructor() {
    this.loadCredentials();
  }

  onPasskeyToggle(): void {
    if (this.loading() || this.busy()) {
      return;
    }

    if (this.passkeyEnabled()) {
      this.confirmDelete();
      return;
    }

    this.registerPasskey();
  }

  private loadCredentials() {
    const identityId = this.stateService.state().identityId;
    if (!identityId) {
      this.loading.set(false);
      this.showErrorModal(ACCOUNT_ERROR, 'Aceptar', () => this.hideModal());
      return;
    }

    this.loading.set(true);
    this.authService.getCredentials(identityId).subscribe({
      next: (result) => this.applyCredentials(result),
      error: (error: unknown) => this.applyCredentials(this.errorPayload(error)),
    });
  }

  private applyCredentials(payload: unknown) {
    const message = registrationErrorMessage(payload, CREDENTIALS_ERROR);
    if (message && /no tienes credenciales guardadas/i.test(message)) {
      this.credentials = [];
      this.passkeyEnabled.set(false);
      this.loading.set(false);
      this.busy.set(false);
      this.hideModal();
      return;
    }

    const credentials = credentialsFromResult(payload);
    if (message || !credentials) {
      this.loading.set(false);
      this.busy.set(false);
      this.showErrorModal(message ?? CREDENTIALS_ERROR, 'Reintentar', () => this.loadCredentials());
      return;
    }

    this.credentials = credentials;
    this.passkeyEnabled.set(credentials.length > 0);
    this.loading.set(false);
    this.busy.set(false);
    this.hideModal();
  }

  private registerPasskey() {
    const state = this.stateService.state();
    if (!state.identityId || !state.email) {
      this.showErrorModal(ACCOUNT_ERROR, 'Aceptar', () => this.hideModal());
      return;
    }
    if (!window.PublicKeyCredential || !window.isSecureContext) {
      this.showErrorModal(UNSUPPORTED_ERROR, 'Aceptar', () => this.hideModal());
      return;
    }

    this.busy.set(true);
    this.showLoaderModal('Creando Passkey');
    this.registrationService
      .passkeyOptions({
        identityId: state.identityId,
        email: state.email,
        displayName: PASSKEY_DISPLAY_NAME,
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

    this.loadCredentials();
  }

  private confirmDelete() {
    this.stateService.setModalData({
      show: true,
      imageSize: 'large',
      title: 'Eliminar passkey',
      description: 'Esto borrará el passkey.',
      image: 'images/error.svg',
      buttonText: 'Eliminar',
      closeable: true,
      buttonAction: () => this.deletePasskeys(),
    });
  }

  private deletePasskeys() {
    const identityId = this.stateService.state().identityId;
    const credentialIds = this.credentials.map((credential) => credential.fidoCredentialId);
    if (!identityId || credentialIds.length === 0) {
      this.showErrorModal(ACCOUNT_ERROR, 'Aceptar', () => this.hideModal());
      return;
    }

    this.busy.set(true);
    this.showLoaderModal('Eliminando passkey');
    this.deleteNext(identityId, credentialIds, 0);
  }

  private deleteNext(identityId: string, credentialIds: string[], index: number) {
    const fidoCredentialId = credentialIds[index];
    if (!fidoCredentialId) {
      this.loadCredentials();
      return;
    }

    this.authService.deleteCredential(identityId, fidoCredentialId).subscribe({
      next: (result) => {
        const message = registrationErrorMessage(result, DELETE_ERROR);
        if (message) {
          this.fail(message);
          return;
        }
        this.deleteNext(identityId, credentialIds, index + 1);
      },
      error: (error: unknown) => this.fail(this.errorPayload(error), DELETE_ERROR),
    });
  }

  private fail(payload: unknown, fallback = REGISTER_ERROR) {
    this.busy.set(false);
    const description = typeof payload === 'string' ? payload : registrationErrorMessage(payload, fallback);
    this.showErrorModal(description ?? fallback, 'Aceptar', () => this.hideModal());
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
