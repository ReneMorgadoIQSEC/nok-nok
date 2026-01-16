import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { LoginDataService } from '../../../services/login/login-data.service';
import { LoginSteps, StartStep } from '../../../models/login/steps';
import { Auth } from '../../../services/auth/auth';

@Component({
  selector: 'app-password',
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  templateUrl: './password.html',
})
export class Password {
  passwordForm: FormGroup;
  email: string;

  constructor(private formBuilder: FormBuilder, private router: Router, private loginDataService: LoginDataService, private auth: Auth) {
    this.passwordForm = this.formBuilder.group({
      password: ['', [Validators.required, Validators.minLength(8)]],
    });
    this.email = this.loginDataService.getStepData<StartStep>(LoginSteps.START).email;
  }
  onSubmit() { 
    this.loginDataService.updateCurrentStep(LoginSteps.PASSWORD, { [LoginSteps.PASSWORD]: { password: this.passwordForm.value.password, completed: true } });
    this.auth.login(this.email, this.passwordForm.value.password);
    this.router.navigate(['/home']);
  }
  onLoginWithPhone(){
    this.loginDataService.triggerPhoneLogin(this.email);
  }
}
