import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { RegisterData, RegisterSteps } from '../../../models/register/steps';
import { RegisterDataService } from '../../../services/register/register-data.service';
import { RegisterHttpService } from '../../../services/register/register-http.service';
import { base64urlToBuffer } from '../../../utils/base64';
import { Router } from '@angular/router';
@Component({
  selector: 'app-passkey-component',
  imports: [],
  templateUrl: './passkey.html'
})
export class PasskeyComponent {
  openLoader = false;
  showError = false;
  errorMessage = '';
  registerData = {} as RegisterData;

  constructor(private registerDataService: RegisterDataService, private registerHttpService: RegisterHttpService, private router: Router, private cdr: ChangeDetectorRef) {
    this.registerData = this.registerDataService.state;
  }

  async onContinue() {
    this.openLoader = true;
    const options = await this.getOptions();
    if(options.success) {
      options.data.challenge = base64urlToBuffer(options.data.challenge);
      options.data.user.id = base64urlToBuffer(options.data.user.id);
      if ('credentials' in navigator) {
        const cred = (await navigator.credentials.create({publicKey: options.data })) as PublicKeyCredential;
        const response = await this.registerHttpService.registerResponse(this.registerData.data.email, cred);
        if(response.success) {
          this.registerDataService.updateCurrentStep(RegisterSteps.OTP, { passkey: { completed: true } });
          this.router.navigate(['/register/otp']);
        } else {
          this.showErrorMessage('Ocurrió un error al registrar el Passkey');
        }
      } else {
        this.showErrorMessage('Tu navegador no soporta Passkeys');
      }
    } else {
      this.showErrorMessage('Ocurrió un error al obtener las opciones de registro');
    }
  }

  async getOptions() {
    const options = await this.registerHttpService.registerRequest(this.registerData.data.email, this.registerData.data.name, this.registerData.data.phone || '');
    if (options.success) {
      return options.data;
    } else {
      return null;
    }
  }

  showErrorMessage(message: string) {
    this.openLoader = false;
    this.showError = true;
    this.errorMessage = message;
    this.cdr.detectChanges();
    setTimeout(() => {
      this.showError = false;
      this.cdr.detectChanges();
    }, 3000);
  }
}
