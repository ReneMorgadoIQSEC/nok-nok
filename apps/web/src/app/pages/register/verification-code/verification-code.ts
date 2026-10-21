import { Component, inject, signal } from '@angular/core';
import { StateService } from '../../../services/state';
import { Code } from '../../../components/code/code';

@Component({
  selector: 'app-verification-code',
  imports: [Code],
  templateUrl: './verification-code.html',
})
export class RegisterVerificationCode {
  private readonly stateService = inject(StateService);
  showCode = signal(false);
  sendVerificationCode() {
    this.showLoaderModal();
    setTimeout(() => {
      this.hideLoaderModal();
      this.showCode.set(true);
    }, 3000);
  }

  verifyCode(code: string) {
    console.log(code);
  }

  resendCode() {
    this.sendVerificationCode();
  }

  hideLoaderModal() {
    this.stateService.setModalData({
      show: false,
    });
  }

  showLoaderModal() {
    this.stateService.setModalData({
      show: true,
      imageSize: 'small',
      title: 'Enviando código de verificación',
      description: 'Espera un momento, por favor...',
      image: 'images/loader.gif',
    });
  }

  showErrorModal() {
    this.stateService.setModalData({
      show: true,
      imageSize: 'large',
      title: 'Algo salió mal',
      description: 'No logramos enviar el código. Por favor, vuelve a intentarlo.',
      image: 'images/error.svg',
      buttonText: 'Reintentar',
      closeable: true,
      buttonAction: () => this.sendVerificationCode(),
    });
  }
}
