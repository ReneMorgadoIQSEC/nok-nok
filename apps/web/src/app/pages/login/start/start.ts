import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { LoginSteps } from '../../../models/login/steps';
import { LoginDataService } from '../../../services/login/login-data.service';

@Component({
  selector: 'app-start-component',
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  templateUrl: './start.html'
})
export class StartComponent {
  emailForm: FormGroup;

  constructor(private formBuilder: FormBuilder, private router: Router, private loginDataService: LoginDataService) {
    this.emailForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email, Validators.maxLength(100)]],
    });
  }
  onSubmit() { 
    this.loginDataService.updateCurrentStep(LoginSteps.PASSWORD, { [LoginSteps.START]: { email: this.emailForm.value.email, completed: true } });
    this.router.navigate(['/login/password']);
  }
  onLoginWithPhone(){
    this.loginDataService.updateCurrentStep(LoginSteps.PASSWORD, { [LoginSteps.START]: { email: this.emailForm.value.email, completed: true } });
    this.router.navigate(['/login/password']);
    this.loginDataService.triggerPhoneLogin(this.emailForm.value.email);
  }
}
