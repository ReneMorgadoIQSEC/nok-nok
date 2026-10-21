import { Component, computed, inject } from '@angular/core';
import { StateService } from '../../services/state';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-modal',
  imports: [NgClass],
  templateUrl: './modal.html',
})
export class Modal {
  private readonly stateService = inject(StateService);
  modalData = computed(() => this.stateService.state().modalData);

  closeModal() {
    this.stateService.setModalData(null);
  }
}
