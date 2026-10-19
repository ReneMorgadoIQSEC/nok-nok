import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-input-code',
  imports: [],
  templateUrl: './input-code.html',
})
export class InputCode {
  @Input() length: number = 6;
  @Output() codeReady = new EventEmitter<string[]>();
  @Output() badCode = new EventEmitter<void>();

  code: string[] = [];

  get indexes() {
    return Array.from({ length: this.length }, (_, i) => i);
  }

  onInput(index: number, event: Event) {
    const input = event.target as HTMLInputElement;
    const value = input.value;
    this.code[index] = value;
    if (this.code.length === this.length && this.code.every((code) => code !== '')) {
      this.codeReady.emit(this.code);
    } else {
      this.badCode.emit();
    }
    if (index < this.length - 1) {
      (document.querySelector(`.inputCode__input:nth-child(${index + 2})`) as HTMLInputElement)?.focus();
    }
  }
}
