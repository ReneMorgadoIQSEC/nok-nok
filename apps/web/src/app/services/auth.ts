import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { clearSession, readSession, tokenFromResult, writeSession } from '../interfaces/auth';
import { PasskeyAssertion } from './webauthn';
import { UpstreamResult } from '../interfaces/registration';
import { StateService } from './state';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly stateService = inject(StateService);

  restore() {
    this.stateService.setAuthenticated(this.hasSession());
  }

  hasSession(): boolean {
    return !!readSession();
  }

  getIdentityByEmail(email: string) {
    return this.http.get<UpstreamResult<Record<string, unknown>>>(`${environment.apiUrl}/auth/identity`, {
      params: { email },
    });
  }

  passkeyLoginOptions(input: { identityId: string; email: string }) {
    return this.http.post<UpstreamResult<Record<string, unknown>>>(
      `${environment.apiUrl}/auth/passkey/options`,
      input,
    );
  }

  validatePasskey(input: { credential: PasskeyAssertion; challenge: string; identityId: string }) {
    return this.http.post<UpstreamResult<Record<string, unknown>>>(
      `${environment.apiUrl}/auth/passkey`,
      input,
    );
  }

  login(identityId: string, password: string) {
    return this.http.post<UpstreamResult<Record<string, unknown>>>(`${environment.apiUrl}/auth/login`, {
      identityId,
      password,
    });
  }

  saveSession(payload: unknown): boolean {
    const token = tokenFromResult(payload);
    if (!token) {
      return false;
    }

    writeSession({ token });
    this.stateService.setAuthenticated(true);
    this.stateService.clearPassword();
    return true;
  }

  logout() {
    clearSession();
    this.stateService.resetState();
  }
}
