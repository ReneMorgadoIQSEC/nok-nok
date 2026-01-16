import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RestrictInputDirective } from '../../../directives/restrict-input.directive';
import { RegisterDataService } from '../../../services/register/register-data.service';
import { RegisterSteps } from '../../../models/register/steps';
import { Router } from '@angular/router';

@Component({
  selector: 'app-data-component',
  imports: [ReactiveFormsModule, CommonModule, RestrictInputDirective],
  templateUrl: './data.html'
})

export class DataComponent {
  form: FormGroup;

  constructor(private formBuilder: FormBuilder, private registerDataService: RegisterDataService, private router: Router) {
    this.form = this.formBuilder.group({
      name: ['', [Validators.required, Validators.maxLength(100), Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(100)]],
      phone: ['', [Validators.maxLength(15), Validators.pattern(/^(?!([0-9])\1{9})[1-9]\d{9}$/), Validators.minLength(10)]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required, Validators.minLength(8)]],
    }, {
      validators: [this.passwordMatchValidator]
    });
  }

  onSubmit() {
    this.registerDataService.updateCurrentStep(RegisterSteps.OTP, { data: { ...this.form.value, completed: true } });
    this.router.navigate(['/register/otp']);
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }
}
