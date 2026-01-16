import { Injectable } from '@angular/core';
import { bufferToBase64url } from '../../utils/base64';
import { ServiceResponse } from '../../models/services';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, delay, map, Observable, of } from 'rxjs';
import { fail, ok } from '../../utils/responses';

@Injectable({
  providedIn: 'root',
})
export class RegisterHttpService {
  private readonly apiUrl = 'http://localhost:3000/fido';

  constructor(private http: HttpClient) {}

  registerRequest$(email: string, name: string, phone: string): Observable<ServiceResponse<any>> {
    return this.http
      .post<ServiceResponse<any>>(`${this.apiUrl}/register-request`, { email, name, phone })
      .pipe(
        map((res: ServiceResponse<any>) => {
          if (!res.success) {
            return fail(res.message ?? 'Request rejected');
          }
          return ok(res.data ?? null, res.message);
        }),
        catchError((err: HttpErrorResponse) => of(fail(this.mapHttpError(err))))
      );
  }

  registerResponse$(email: string, credential: any): Observable<ServiceResponse<any>> {
    const attestation = {
      id: credential.id,
      rawId: bufferToBase64url(credential.rawId),
      type: credential.type,
      response: {
        clientDataJSON: bufferToBase64url(credential.response.clientDataJSON),
        attestationObject: bufferToBase64url(credential.response.attestationObject),
      },
    };
    return this.http.post<ServiceResponse<any>>(`${this.apiUrl}/register-response`, { email, attestation }).pipe(
      map((res: ServiceResponse<any>) => {
        if (!res.success) {
          return fail(res.message ?? 'Request rejected');
        }
        return ok(res.data ?? null, res.message);
      }),
      catchError((err: HttpErrorResponse) => of(fail(this.mapHttpError(err))))
    );
  }

  sendMailCode$(email: string): Observable<ServiceResponse<any>> {
    return of(ok(null, 'Send mail code successful')).pipe(
      delay(3000)
    );
    return this.http.post<ServiceResponse<any>>(`${this.apiUrl}/send-mail-code`, { email }).pipe(
      map((res: ServiceResponse<any>) => {
        if (!res.success) {
          return fail(res.message ?? 'Request rejected');
        }
        return ok(res.data ?? null, res.message);
      }),
      catchError((err: HttpErrorResponse) => of(fail(this.mapHttpError(err))))
    );
  }

  private mapHttpError(err: HttpErrorResponse): string {
    if (err.status === 0) return 'Network error';
    if (err.status >= 500) return 'Server error';
    if (err.status === 400) return err.error?.message ?? 'Bad request';

    return 'Unexpected error';
  }
}
