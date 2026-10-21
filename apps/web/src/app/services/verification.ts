import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { UtilitiesResult } from '../interfaces/utilities';

@Injectable({
  providedIn: 'root',
})
export class VerificationService {
  private readonly http = inject(HttpClient);

  sendCodeEmail(email: string) {
    return this.http.post<UtilitiesResult>(`${environment.apiUrl}/utilities/send-code-email`, {
      email,
    });
  }

  verifyCodeEmail(email: string, code: string) {
    return this.http.post<UtilitiesResult>(`${environment.apiUrl}/utilities/verify-code-email`, {
      email,
      code,
    });
  }
}
