import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import {
  verificationErrorMessage,
  verificationEstado,
} from '../../../interfaces/utilities';
import { StateService } from '../../../services/state';
import { VerificationService } from '../../../services/verification';
import { Code } from '../../../components/code/code';
import { ERegisterStep } from '../../../interfaces/IState';
import {
  registrationErrorMessage,
  userIdFromResult,
} from '../../../interfaces/registration';
import { RegistrationService } from '../../../services/registration';
import { Router } from '@angular/router';

const SEND_ERROR = 'No logramos enviar el código. Por favor, vuelve a intentarlo.';
const VERIFY_ERROR = 'No logramos verificar el código. Por favor, vuelve a intentarlo.';
const REGISTER_ERROR = 'No logramos crear tu cuenta. Por favor, vuelve a intentarlo.';
const ACCOUNT_ERROR = 'No encontramos los datos de tu registro. Vuelve al inicio e inténtalo de nuevo.';

@Component({
  selector: 'app-verification-code',
  imports: [Code],
  templateUrl: './verification-code.html',
})
export class RegisterVerificationCode {
  private readonly stateService = inject(StateService);
  private readonly verificationService = inject(VerificationService);
  private readonly registrationService = inject(RegistrationService);
  private readonly router = inject(Router);
  private pendingCode = '';
  showCode = signal(false);

  sendVerificationCode() {
    const email = this.stateService.state().email.trim();
    if (!email) {
      this.showErrorModal(
        'No encontramos un correo para enviar el código. Regresa al paso anterior e ingrésalo.',
        'Aceptar',
        () => this.hideLoaderModal(),
      );
      return;
    }

    this.showLoaderModal('Enviando código de verificación');
    this.verificationService.sendCodeEmail(email).subscribe({
      next: (result) => this.handleSendResult(result),
      error: (error: unknown) => this.handleSendResult(this.errorPayload(error)),
    });
  }

  verifyCode(code: string) {
    const email = this.stateService.state().email.trim();
    this.pendingCode = code;
    if (!email) {
      this.showErrorModal(
        'No encontramos un correo para verificar el código. Regresa al paso anterior e ingrésalo.',
        'Aceptar',
        () => this.hideLoaderModal(),
      );
      return;
    }

    this.showLoaderModal('Verificando código');
    this.verificationService.verifyCodeEmail(email, code).subscribe({
      next: (result) => this.handleVerifyResult(result),
      error: (error: unknown) => this.handleVerifyResult(this.errorPayload(error)),
    });
  }

  resendCode() {
    this.sendVerificationCode();
  }

  private handleSendResult(payload: unknown) {
    const message = verificationErrorMessage(payload, SEND_ERROR);
    if (!message) {
      this.hideLoaderModal();
      this.showCode.set(true);
      return;
    }

    this.showErrorModal(message, 'Reintentar', () => this.sendVerificationCode());
  }

  private handleVerifyResult(payload: unknown) {
    const message = verificationErrorMessage(payload, VERIFY_ERROR);
    if (!message) {
      this.registerAccount();
      return;
    }

    const estado = verificationEstado(payload);
    if (estado === null) {
      this.showErrorModal(message, 'Reintentar', () => this.verifyCode(this.pendingCode));
      return;
    }

    this.showErrorModal(message, 'Aceptar', () => this.hideLoaderModal());
  }

  private registerAccount() {
    const state = this.stateService.state();
    if (!state.identityId || !state.deviceId || !state.fullName || !state.email || !state.password) {
      this.showErrorModal(ACCOUNT_ERROR, 'Aceptar', () => this.hideLoaderModal());
      return;
    }

    this.showLoaderModal('Creando tu cuenta');
    this.registrationService
      .registerUser({
        identityId: state.identityId,
        fullName: state.fullName,
        email: state.email,
        phoneNumber: state.phoneNumber,
        password: state.password,
        deviceId: state.deviceId,
      })
      .subscribe({
        next: (result) => this.handleRegisterResult(result),
        error: (error: unknown) => this.handleRegisterResult(this.errorPayload(error)),
      });
  }

  private handleRegisterResult(payload: unknown) {
    const message = registrationErrorMessage(payload, REGISTER_ERROR);
    const userId = userIdFromResult(payload);
    if (message || !userId) {
      this.showErrorModal(message ?? REGISTER_ERROR, 'Reintentar', () => this.registerAccount());
      return;
    }

    this.stateService.setUserId(userId);
    this.stateService.clearPassword();
    this.stateService.setRegisterStep(ERegisterStep.Passkey);
    this.hideLoaderModal();
    void this.router.navigate(['/register', ERegisterStep.Passkey]);
  }

  private errorPayload(error: unknown) {
    return error instanceof HttpErrorResponse ? error.error : error;
  }

  hideLoaderModal() {
    this.stateService.setModalData({
      show: false,
    });
  }

  showLoaderModal(title: string) {
    this.stateService.setModalData({
      show: true,
      imageSize: 'small',
      title,
      description: 'Espera un momento, por favor...',
      image: 'images/loader.gif',
    });
  }

  showErrorModal(description: string, buttonText: string, buttonAction: () => void) {
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
