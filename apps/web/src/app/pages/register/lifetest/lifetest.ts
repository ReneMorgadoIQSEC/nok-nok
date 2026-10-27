import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { LifeTest } from '../../../components/life-test/life-test';
import { facialErrorMessage, isFacialMatch } from '../../../interfaces/facial';
import { EAuthenticatedPages } from '../../../interfaces/IState';
import { LifeTestFramesEvent } from '../../../interfaces/IYuNet';
import { registrationErrorMessage } from '../../../interfaces/registration';
import { AuthService } from '../../../services/auth';
import { FacialService } from '../../../services/facial';
import { StateService } from '../../../services/state';

const LOGIN_ERROR = 'No logramos iniciar tu sesión. Por favor, vuelve a intentarlo.';
const ACCOUNT_ERROR = 'No encontramos los datos de tu registro. Vuelve al inicio e inténtalo de nuevo.';

@Component({
  selector: 'app-lifetest',
  imports: [LifeTest],
  templateUrl: './lifetest.html',
})
export class Lifetest {
  @ViewChild(LifeTest) lifeTest?: LifeTest;
  private readonly router = inject(Router);
  private readonly stateService = inject(StateService);
  private readonly facialService = inject(FacialService);
  private readonly authService = inject(AuthService);
  actionSelected: string = '';
  showLifetest: boolean = false;
  description: string = 'La <strong>captura</strong> se hará <strong>automáticamente</strong>, coloca tu rostro dentro del <strong>círculo</strong>.';

  continueWithSelection() {
    if (this.actionSelected === 'lifeTest') {
      this.showLifetest = true;
      return;
    }

    this.enterPlatform(false);
  }

  onFramesCaptured(event: LifeTestFramesEvent): void {
    const images = event.frames.filter((frame) => frame.trim());
    if (images.length === 0) {
      this.showErrorModal('No se capturaron imágenes para validar.', 'Intentar de nuevo', () => {
        this.retryLifeTest();
      });
      return;
    }

    this.showLoaderModal('Estamos validando tu foto');
    this.facialService.compareImages(images).subscribe({
      next: (result) => this.handleCompareResult(result),
      error: (error: unknown) =>
        this.handleCompareResult(error instanceof HttpErrorResponse ? error.error : error),
    });
  }

  private handleCompareResult(payload: unknown) {
    if (isFacialMatch(payload)) {
      this.enterPlatform(true);
      return;
    }

    this.showErrorModal(facialErrorMessage(payload), 'Intentar de nuevo', () => {
      this.retryLifeTest();
    });
  }

  private retryLifeTest() {
    this.hideLoaderModal();
    void this.lifeTest?.restart();
  }

  private enterPlatform(afterLifeTest: boolean) {
    const state = this.stateService.state();
    if (!state.identityId || !state.password) {
      this.showErrorModal(ACCOUNT_ERROR, 'Aceptar', () => this.hideLoaderModal());
      return;
    }

    this.showLoaderModal('Iniciando sesión');
    this.authService.login(state.identityId, state.password).subscribe({
      next: (result) => this.handleLoginResult(result, afterLifeTest),
      error: (error: unknown) =>
        this.handleLoginResult(error instanceof HttpErrorResponse ? error.error : error, afterLifeTest),
    });
  }

  private handleLoginResult(payload: unknown, afterLifeTest: boolean) {
    const message = registrationErrorMessage(payload, LOGIN_ERROR);
    if (message || !this.authService.saveSession(payload)) {
      this.showErrorModal(message ?? LOGIN_ERROR, 'Reintentar', () => this.enterPlatform(afterLifeTest));
      return;
    }

    if (afterLifeTest) {
      this.showSuccessModal();
      return;
    }

    this.hideLoaderModal();
    void this.router.navigate([EAuthenticatedPages.Home]);
  }

  onValidationError(event: string): void {
    this.description = event;
  }

  onCameraError(_event: string): void {
    console.log('onCameraError', _event);
    this.showErrorModal(_event, 'Intentar de nuevo', () => {
      void this.retryCameraAccess();
    });
  }

  private async retryCameraAccess(): Promise<void> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: { facingMode: 'user' },
      });
      stream.getTracks().forEach((track) => track.stop());

      if (this.lifeTest) {
        await this.lifeTest.restart();
        return;
      }
    } catch {
      this.showErrorModal('Error al acceder a la cámara', 'Intentar de nuevo', () => {
        void this.retryCameraAccess();
      });
    }
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

  private hideLoaderModal() {
    this.stateService.setModalData({
      show: false,
    });
  }

  private showSuccessModal() {
    this.stateService.setModalData({
      show: true,
      imageSize: 'large',
      title: 'Prueba de vida exitosa',
      image: 'images/check.svg',
      buttonText: 'Aceptar',
      closeable: true,
      buttonAction: () => {
        this.hideLoaderModal();
        void this.router.navigate([EAuthenticatedPages.Home]);
      },
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
