import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ERegisterStep } from '../../../interfaces/IState';
import { identityFromResult, registrationErrorMessage } from '../../../interfaces/registration';
import { readClientEnvironment } from '../../../services/client-environment';
import { RegistrationService } from '../../../services/registration';
import { StateService } from '../../../services/state';

const IDENTITY_ERROR = 'No logramos crear tu identidad. Por favor, vuelve a intentarlo.';

function passwordsMatch(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password')?.value;
  const confirmation = control.get('confirmPassword')?.value;

  if (!password || !confirmation) {
    return null;
  }

  return password === confirmation ? null : { passwordMismatch: true };
}

@Component({
  selector: 'app-register-start',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './start.html',
})
export class RegisterStart {
  private readonly router = inject(Router);
  private readonly stateService = inject(StateService);
  private readonly registrationService = inject(RegistrationService);
  private readonly formBuilder = inject(FormBuilder);
  private submitting = false;

  readonly form = this.formBuilder.group(
    {
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.minLength(10), Validators.pattern(/^\d+$/), Validators.maxLength(10)]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required],
    },
    { validators: passwordsMatch },
  );



  onSubmit(): void {
    if (this.form.invalid || this.submitting) {
      return;
    }

    const account = {
      fullName: this.form.controls.name.value?.trim() ?? '',
      email: this.form.controls.email.value?.trim() ?? '',
      phoneNumber: this.form.controls.phone.value?.trim() ?? '',
      password: this.form.controls.password.value ?? '',
    };

    this.submitting = true;
    this.showLoaderModal('Creando tu identidad');
    this.registrationService.createIdentity(readClientEnvironment()).subscribe({
      next: (result) => this.handleIdentityResult(result, account),
      error: (error: unknown) => this.handleIdentityResult(this.errorPayload(error), account),
    });
  }

  private handleIdentityResult(
    payload: unknown,
    account: { fullName: string; email: string; phoneNumber: string; password: string },
  ) {
    const message = registrationErrorMessage(payload, IDENTITY_ERROR);
    const identity = identityFromResult(payload);
    if (message || !identity) {
      this.submitting = false;
      this.showErrorModal(message ?? IDENTITY_ERROR, 'Reintentar', () => this.onSubmit());
      return;
    }

    this.stateService.setAccount(account);
    this.stateService.setIdentity(identity.identityId, identity.deviceId);
    this.stateService.setRegisterStep(ERegisterStep.VerificationCode);
    this.submitting = false;
    this.hideLoaderModal();
    void this.router.navigate(['/register', ERegisterStep.VerificationCode]);
  }

  private errorPayload(error: unknown) {
    return error instanceof HttpErrorResponse ? error.error : error;
  }

  private hideLoaderModal() {
    this.stateService.setModalData({
      show: false,
    });
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

  // Field Errors
  nameError(): string | null {
    const name = this.form.controls.name;
    if (!name.touched) {
      return null;
    }
    if (name.hasError('required')) {
      return 'Ingresa un nombre';
    }
    if (name.hasError('minlength')) {
      return 'El nombre debe tener al menos 3 caracteres';
    }
    return null;
  }
  emailError(): string | null {
    const email = this.form.controls.email;
    if (!email.touched) {
      return null;
    }
    if (email.hasError('required')) {
      return 'Ingresa un correo electrónico';
    }
    if (email.hasError('email')) {
      return 'Ingresa un correo electrónico válido';
    }
    return null;
  }
  phoneError(): string | null {
    const phone = this.form.controls.phone;
    if (!phone.touched) {
      return null;
    }
    if (phone.hasError('minlength')) {
      return 'El número telefónico debe tener al menos 10 dígitos';
    }
    if (phone.hasError('maxlength')) {
      return 'El número telefónico debe tener como máximo 10 dígitos';
    }
    if (phone.hasError('pattern')) {
      return 'El número telefónico debe contener solo números';
    }
    return null;
  }
  passwordError(): string | null {
    const password = this.form.controls.password;
    if (!password.touched) {
      return null;
    }
    if (password.hasError('required')) {
      return 'Ingresa una contraseña';
    }
    if (password.hasError('minlength')) {
      return 'La contraseña debe tener al menos 8 caracteres';
    }
    return null;
  }
  confirmPasswordError(): string | null {
    const confirmPassword = this.form.controls.confirmPassword;
    if (!confirmPassword.touched) {
      return null;
    }
    if (confirmPassword.hasError('required')) {
      return 'Confirma tu contraseña';
    }
    if (this.form.hasError('passwordMismatch')) {
      return 'Las contraseñas no coinciden';
    }
    return null;
  }
}
