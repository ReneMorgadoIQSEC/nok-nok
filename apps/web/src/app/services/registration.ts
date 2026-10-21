import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { PasskeyCredential, UpstreamResult } from '../interfaces/registration';
import { ClientEnvironment } from './client-environment';

@Injectable({
  providedIn: 'root',
})
export class RegistrationService {
  private readonly http = inject(HttpClient);

  createIdentity(environmentInfo: ClientEnvironment) {
    return this.http.post<UpstreamResult<Record<string, unknown>>>(
      `${environment.apiUrl}/registration/identity`,
      environmentInfo,
    );
  }

  registerUser(input: {
    identityId: string;
    fullName: string;
    email: string;
    phoneNumber: string;
    password: string;
    deviceId: string;
  }) {
    return this.http.post<UpstreamResult<Record<string, unknown>>>(
      `${environment.apiUrl}/registration/user`,
      input,
    );
  }

  passkeyOptions(input: { identityId: string; email: string; displayName: string }) {
    return this.http.post<UpstreamResult<Record<string, unknown>>>(
      `${environment.apiUrl}/registration/passkey/options`,
      input,
    );
  }

  registerPasskey(input: { credential: PasskeyCredential; challenge: string; identityId: string }) {
    return this.http.post<UpstreamResult<Record<string, unknown>>>(
      `${environment.apiUrl}/registration/passkey`,
      input,
    );
  }
}
