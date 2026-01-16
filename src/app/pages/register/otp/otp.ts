import { Component } from '@angular/core';
import { MailCode } from '../../../components/mail-code/mail-code';

@Component({
  selector: 'app-otp-component',
  imports: [MailCode],
  templateUrl: './otp.html'
})
export class OtpComponent {
  openMailCode = false;
  onContinue() {
    this.openMailCode = true;
  }

  onCloseMailCode() {
    this.openMailCode = false;
  }
}
