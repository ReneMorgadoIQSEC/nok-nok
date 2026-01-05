import { Injectable } from '@angular/core';
import { bufferToBase64url } from '../../utils/base64';
import { ServiceResponse } from '../../models/services';

@Injectable({
  providedIn: 'root',
})
export class RegisterHttpService {
  private readonly apiUrl = 'http://localhost:3000/fido';

  async registerRequest(email: string, name: string, phone: string): Promise<ServiceResponse<any>> {
    try {
      const res = await fetch(`${this.apiUrl}/register-request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, phone }),
      });
      return {
        success: true,
        data: res.json(),
        message: 'Request successful',
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: 'Request failed',
      };
    }
  }
  async registerResponse(email: string, credential: any): Promise<ServiceResponse<any>> {
    try {
      const attestation = {
        id: credential.id,
        rawId: bufferToBase64url(credential.rawId),
        type: credential.type,
        response: {
          clientDataJSON: bufferToBase64url(credential.response.clientDataJSON),
          attestationObject: bufferToBase64url(credential.response.attestationObject),
        },
      };
      const res = await fetch(`${this.apiUrl}/register-response`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, attestation }),
      });
      return {
        success: true,
        data: res.json(),
        message: 'Response successful',
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: 'Response failed',
      };
    }
  }
}
