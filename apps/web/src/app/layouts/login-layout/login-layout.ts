import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LoginDataService } from '../../services/login/login-data.service';
@Component({
  selector: 'app-login-layout',
  imports: [RouterOutlet],
  templateUrl: './login-layout.html'
})
export class LoginLayout {
  constructor(private loginDataService: LoginDataService) {
    this.loginDataService.onPhoneLogin.subscribe((email) => {
      console.log('phone login', email);
    });
  }
}
