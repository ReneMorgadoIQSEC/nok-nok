import { Routes } from '@angular/router';
import { authGuard } from './guards/auth-guard';
import { guestGuard } from './guards/guest-guard';
import { loginStepGuard } from './guards/login-step-guard';
import { registerStepGuard } from './guards/register-step-guard';
import { ELoginStep, ERegisterStep } from './interfaces/IState';
import { Home } from './pages/home/home';
import { LoginLayout } from './pages/login/login-layout/login-layout';
import { LoginStart } from './pages/login/start/start';
import { RegisterLayout } from './pages/register/register-layout/register-layout';
import { RegisterStart } from './pages/register/start/start';
import { RegisterVerificationCode } from './pages/register/verification-code/verification-code';
import { Passkey } from './pages/register/passkey/passkey';
import { Lifetest } from './pages/register/lifetest/lifetest';
import { Password } from './pages/login/password/password';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  {
    path: 'login',
    component: LoginLayout,
    canActivate: [guestGuard],
    canActivateChild: [loginStepGuard],
    children: [
      {
        path: '',
        component: LoginStart,
        data: { step: ELoginStep.Start },
      },
      {
        path: ELoginStep.Password,
        component: Password,
        data: { step: ELoginStep.Password },
      },
    ],
  },
  {
    path: 'register',
    component: RegisterLayout,
    canActivate: [guestGuard],
    //canActivateChild: [registerStepGuard],
    children: [
      {
        path: '',
        component: RegisterStart,
        data: { step: ERegisterStep.Start },
      },
      {
        path: ERegisterStep.VerificationCode,
        component: RegisterVerificationCode,
        data: { step: ERegisterStep.VerificationCode },
      },
      {
        path: ERegisterStep.Passkey,
        component: Passkey,
        data: { step: ERegisterStep.Passkey },
      },
      {
        path: ERegisterStep.LifeTest,
        component: Lifetest,
        data: { step: ERegisterStep.LifeTest },
      },
    ],
  },
  { path: 'home', component: Home, canActivate: [authGuard] },
  { path: '**', redirectTo: 'login' },
];
