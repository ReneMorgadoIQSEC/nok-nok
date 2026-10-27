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

  email = "";

  restore() {
    const session = readSession();
    this.stateService.setAuthenticated(!!session);
    if (!session) {
      return;
    }

    if (session.email) {
      this.email = session.email;
      this.stateService.setEmail(session.email);
    }
    if (session.identityId) {
      this.stateService.setIdentity(session.identityId, this.stateService.state().deviceId);
    }
  }

  hasSession(): boolean {
    return !!readSession();
  }

  getIdentityByEmail(email: string) {
    this.email = email;
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

  getCredentials(identityId: string) {
    return this.http.get<UpstreamResult<Record<string, unknown>>>(`${environment.apiUrl}/auth/credentials`, {
      params: { identityId },
    });
  }

  deleteCredential(identityId: string, fidoCredentialId: string) {
    return this.http.post<UpstreamResult<Record<string, unknown>>>(`${environment.apiUrl}/auth/credentials`, {
      identityId,
      fidoCredentialId,
    });
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

    const state = this.stateService.state();
    writeSession({
      token,
      identityId: state.identityId,
      email: state.email,
    });
    this.email = state.email;
    this.stateService.setAuthenticated(true);
    this.stateService.clearPassword();
    return true;
  }

  logout() {
    clearSession();
    this.stateService.resetState();
  }
}
