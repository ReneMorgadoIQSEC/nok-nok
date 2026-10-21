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
import { Router } from '@angular/router';

const SEND_ERROR = 'No logramos enviar el código. Por favor, vuelve a intentarlo.';
const VERIFY_ERROR = 'No logramos verificar el código. Por favor, vuelve a intentarlo.';

@Component({
  selector: 'app-verification-code',
  imports: [Code],
  templateUrl: './verification-code.html',
})
export class RegisterVerificationCode {
  private readonly stateService = inject(StateService);
  private readonly verificationService = inject(VerificationService);
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
      this.hideLoaderModal();
      // Retomar aquí el flujo posterior a la verificación exitosa.
      console.log('Verificación exitosa', payload);
      this.stateService.setRegisterStep(ERegisterStep.Passkey);
      void this.router.navigate(['/register', ERegisterStep.Passkey]);
      return;
    }

    const estado = verificationEstado(payload);
    if (estado === null) {
      this.showErrorModal(message, 'Reintentar', () => this.verifyCode(this.pendingCode));
      return;
    }

    this.showErrorModal(message, 'Aceptar', () => this.hideLoaderModal());
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
