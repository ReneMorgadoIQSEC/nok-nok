import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth-guard';
import { NoAuthGuard } from './guards/no-auth-guard';
import { RegisterStepGuard } from './guards/register-step-guard';

import { RegisterLayout } from './layouts/register-layout/register-layout';
import { LoginLayout } from './layouts/login-layout/login-layout';
import { AppShellLayout } from './layouts/app-shell-layout/app-shell-layout';

import { DataComponent } from './pages/register/data/data';
import { PasskeyComponent } from './pages/register/passkey/passkey';
import { OtpComponent } from './pages/register/otp/otp';
import { AskAntispoofingComponent } from './pages/register/ask-antispoofing/ask-antispoofing';
import { AntispoofingComponent } from './pages/register/antispoofing/antispoofing';

import { StartComponent } from './pages/login/start/start';

import { HomeComponent } from './pages/home/home/home';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'home' },

  {
    path: 'register',
    component: RegisterLayout,
    canActivate: [NoAuthGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'data' },
      { path: 'data', component: DataComponent },
      { path: 'otp', component: OtpComponent, /*canActivate: [RegisterStepGuard] */ },
      { path: 'passkey', component: PasskeyComponent, /*canActivate: [RegisterStepGuard] */ },
      { path: 'ask-antispoofing', component: AskAntispoofingComponent, /*canActivate: [RegisterStepGuard] */ },
      { path: 'antispoofing', component: AntispoofingComponent, /*canActivate: [RegisterStepGuard] */ },
    ],
  },

  {
    path: 'login',
    component: LoginLayout,
    canActivate: [NoAuthGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'start' },
      { path: 'start', component: StartComponent },
      // { path: 'otp', component: LoginOtpComponent, canActivate: [LoginStepGuard] },
      // { path: 'passkey', component: LoginPasskeyComponent, canActivate: [LoginStepGuard] },
    ],
  },

  {
    path: '',
    component: AppShellLayout,
    canActivateChild: [AuthGuard],
    children: [
      { path: 'home', component: HomeComponent },
    ],
  },

  { path: '**', redirectTo: 'home' },
];
