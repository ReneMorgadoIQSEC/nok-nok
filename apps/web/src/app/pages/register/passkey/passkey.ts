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

  onSkip() {
    this.registerDataService.updateCurrentStep(RegisterSteps.ASK_ANTISPOOFING, { passkey: { completed: true } });
    this.router.navigate(['/register/ask-antispoofing']);
  }

  onContinue() {
    this.registerDataService.updateCurrentStep(RegisterSteps.ASK_ANTISPOOFING, { passkey: { completed: true } });
    this.router.navigate(['/register/ask-antispoofing']);
    /*
    No irá en V1
    this.openLoader = true;
    this.registerHttpService.registerRequest$(this.registerData.data.email, this.registerData.data.name, this.registerData.data.phone || '').subscribe((response) => {
      if(response.success) {
        response.data.challenge = base64urlToBuffer(response.data.challenge);
        response.data.user.id = base64urlToBuffer(response.data.user.id);
        if ('credentials' in navigator) {
          navigator.credentials.create({publicKey: response.data }).then((cred) => {
            if(cred) {
              this.registerHttpService.registerResponse$(this.registerData.data.email, cred).subscribe((response) => {
                if(response.success) {
                  this.registerDataService.updateCurrentStep(RegisterSteps.OTP, { passkey: { completed: true } });
                  this.router.navigate(['/register/ask-antispoofing']);
                } else {
                  this.showErrorMessage('Ocurrió un error al registrar el Passkey');
                }
              });
            }
          });
        } else {
          this.showErrorMessage('Tu navegador no soporta Passkeys');
        }
      } else {
        this.showErrorMessage('Ocurrió un error al obtener las opciones de registro');
      }
    });
    */
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
