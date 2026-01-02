import {
  Directive,
  ElementRef,
  HostListener,
  Input,
  OnChanges,
  SimpleChanges,
  Optional
} from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[appRestrictInput]',
  standalone: true
})
export class RestrictInputDirective implements OnChanges {
  @Input('appRestrictInput') pattern: string | RegExp = '';
  @Input() maxLength?: number;

  private charRegex: RegExp | null = null;

  constructor(
    private el: ElementRef<HTMLInputElement>,
    @Optional() private ngControl?: NgControl
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if ('pattern' in changes) {
      if (this.pattern instanceof RegExp) {
        this.charRegex = this.pattern;
      } else if (typeof this.pattern === 'string' && this.pattern.length > 0) {
        this.charRegex = new RegExp(this.pattern, 'g');
      } else {
        this.charRegex = null;
      }
    }
  }

  @HostListener('input', ['$event'])
  onInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const original = input.value;

    let filtered = '';

    if (this.charRegex) {
      for (const ch of original) {
        if (ch.match(this.charRegex)) {
          filtered += ch;
        }
      }
    } else {
      filtered = original;
    }

    if (this.maxLength != null && this.maxLength > 0) {
      filtered = filtered.slice(0, this.maxLength);
    }

    if (filtered !== original) {
      if (this.ngControl?.control) {
        this.ngControl.control.setValue(filtered, { emitEvent: false });
      } else {
        this.el.nativeElement.value = filtered;
      }
    }
  }

  @HostListener('paste', ['$event'])
  onPaste(event: ClipboardEvent): void {
    setTimeout(() => {
      const input = event.target as HTMLInputElement;
      const evt = new Event('input', { bubbles: true });
      input.dispatchEvent(evt);
    });
  }
}
