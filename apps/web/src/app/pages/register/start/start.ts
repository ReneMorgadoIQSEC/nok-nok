import { Component, inject } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { ERegisterStep } from '../../../interfaces/IState';
import { StateService } from '../../../services/state';
import { CommonModule } from '@angular/common';

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
  private readonly formBuilder = inject(FormBuilder);

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
    if (this.form.invalid) {
      return;
    }

    this.stateService.setRegisterStep(ERegisterStep.VerificationCode);
    void this.router.navigate(['/register', ERegisterStep.VerificationCode]);
  }

  // Field Errors
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
