import { request as httpRequest } from 'node:http';
import { request as httpsRequest } from 'node:https';
import { BadGatewayException, Injectable, ServiceUnavailableException } from '@nestjs/common';
import {
  DeleteCredentialInput,
  LoginResult,
  PasskeyLoginOptionsInput,
  ValidatePasskeyInput,
} from './auth.types';

@Injectable()
export class AuthService {
  login(identityId: string, password: string): Promise<LoginResult> {
    return this.request('/Authentication/LoginWeb', 'POST', { identityId, password });
  }

  getIdentityByEmail(email: string): Promise<LoginResult> {
    return this.request(`/UserRegistration/GetIdentityIdByEmail/${encodeURIComponent(email)}`, 'GET');
  }

  passkeyLoginOptions(input: PasskeyLoginOptionsInput): Promise<LoginResult> {
    return this.request('/Challenge/OptionsPassKeyLogin', 'POST', input);
  }

  validatePasskey(input: ValidatePasskeyInput): Promise<LoginResult> {
    return this.request('/Authentication/ValidatePassKey', 'POST', input);
  }

  getCredentials(identityId: string): Promise<LoginResult> {
    return this.request(`/Authentication/GetCredentials/${encodeURIComponent(identityId)}`, 'GET');
  }

  deleteCredential(input: DeleteCredentialInput): Promise<LoginResult> {
    return this.request('/Authentication/DeleteCredential', 'POST', input);
  }

  private request(path: string, method: 'GET' | 'POST', body?: unknown): Promise<LoginResult> {
    const baseUrl = process.env.UTILITIES_API_URL?.trim().replace(/\/$/, '');
    if (!baseUrl) {
      throw new ServiceUnavailableException('Falta la variable UTILITIES_API_URL');
    }

    const target = new URL(baseUrl);
    const payload = body === undefined ? undefined : JSON.stringify(body);
    const transport = target.protocol === 'http:' ? httpRequest : httpsRequest;

    return new Promise((resolve, reject) => {
      const req = transport(
        {
          protocol: target.protocol,
          hostname: target.hostname,
          port: target.port ? Number(target.port) : undefined,
          path,
          method,
          headers: {
            Accept: 'application/json',
            Connection: 'close',
            ...(payload
              ? {
                  'Content-Type': 'application/json',
                  'Content-Length': Buffer.byteLength(payload),
                }
              : {}),
          },
          timeout: 30_000,
        },
        (res) => {
          const chunks: Buffer[] = [];
          res.on('data', (chunk: Buffer) => chunks.push(chunk));
          res.on('end', () => {
            try {
              resolve(this.toResult(Buffer.concat(chunks).toString('utf8')));
            } catch (error) {
              reject(error);
            }
          });
        },
      );

      req.on('timeout', () => {
        req.destroy();
        reject(new BadGatewayException('No fue posible contactar el servicio de acceso'));
      });
      req.on('error', () => {
        reject(new BadGatewayException('No fue posible contactar el servicio de acceso'));
      });
      if (payload) {
        req.write(payload);
      }
      req.end();
    });
  }

  private toResult(raw: string): LoginResult {
    const text = raw.trim();
    if (!text) {
      throw new BadGatewayException('El servicio de acceso respondió de forma inesperada');
    }

    let payload: unknown;
    try {
      payload = JSON.parse(text);
    } catch {
      throw new BadGatewayException('El servicio de acceso respondió de forma inesperada');
    }

    if (typeof payload === 'string' && payload.trim()) {
      return {
        success: false,
        statusCode: 0,
        message: payload.trim(),
        data: {},
      };
    }

    if (!this.isLoginResult(payload)) {
      throw new BadGatewayException('El servicio de acceso respondió de forma inesperada');
    }

    const data = payload.data;
    return {
      success: payload.success,
      statusCode: payload.statusCode,
      message: payload.message,
      data: data && typeof data === 'object' && !Array.isArray(data) ? data : {},
    };
  }

  private isLoginResult(payload: unknown): payload is LoginResult {
    if (!payload || typeof payload !== 'object') {
      return false;
    }

    const candidate = payload as LoginResult;
    return (
      typeof candidate.success === 'boolean' &&
      typeof candidate.statusCode === 'number' &&
      typeof candidate.message === 'string'
    );
  }
}
