import { Component, inject } from '@angular/core';
import { StateService } from '../../../services/state';

@Component({
  selector: 'app-passkey',
  imports: [],
  templateUrl: './passkey.html',
})
export class Passkey {
  private readonly stateService = inject(StateService);
  startPasskeyRegistration() {
    this.showLoaderModal('Creando Passkey');
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
}
