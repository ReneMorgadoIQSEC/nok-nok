import { request as httpRequest } from 'node:http';
import { request as httpsRequest } from 'node:https';
import { BadGatewayException, Injectable, ServiceUnavailableException } from '@nestjs/common';
import {
  CreateIdentityInput,
  PasskeyOptionsInput,
  RegisterPasskeyInput,
  RegisterUserInput,
  UpstreamResult,
} from './registration.types';

@Injectable()
export class RegistrationService {
  createIdentity(input: CreateIdentityInput) {
    return this.post('/UserRegistration/CreateIndentityWeb', input);
  }

  registerUser(input: RegisterUserInput) {
    return this.post('/UserRegistration/RegisterWeb', input);
  }

  passkeyOptions(input: PasskeyOptionsInput) {
    return this.post('/Challenge/OptionsPassKey', input);
  }

  registerPasskey(input: RegisterPasskeyInput) {
    return this.post('/Authentication/RegisterPassKey', input);
  }

  private post(path: string, body: unknown): Promise<UpstreamResult<Record<string, unknown>>> {
    const baseUrl = process.env.UTILITIES_API_URL?.trim().replace(/\/$/, '');
    if (!baseUrl) {
      throw new ServiceUnavailableException('Falta la variable UTILITIES_API_URL');
    }

    const target = new URL(baseUrl);
    const payload = JSON.stringify(body);
    const transport = target.protocol === 'http:' ? httpRequest : httpsRequest;

    return new Promise((resolve, reject) => {
      const req = transport(
        {
          protocol: target.protocol,
          hostname: target.hostname,
          port: target.port ? Number(target.port) : undefined,
          path,
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            'Content-Length': Buffer.byteLength(payload),
            Connection: 'close',
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
        reject(new BadGatewayException('No fue posible contactar el servicio de registro'));
      });
      req.on('error', () => {
        reject(new BadGatewayException('No fue posible contactar el servicio de registro'));
      });
      req.write(payload);
      req.end();
    });
  }

  private toResult(raw: string): UpstreamResult<Record<string, unknown>> {
    const text = raw.trim();
    if (!text) {
      throw new BadGatewayException('El servicio de registro respondió de forma inesperada');
    }

    let payload: unknown;
    try {
      payload = JSON.parse(text);
    } catch {
      throw new BadGatewayException('El servicio de registro respondió de forma inesperada');
    }

    if (typeof payload === 'string' && payload.trim()) {
      return {
        success: false,
        statusCode: 0,
        message: payload.trim(),
        data: {},
      };
    }

    if (!this.isUpstreamResult(payload)) {
      throw new BadGatewayException('El servicio de registro respondió de forma inesperada');
    }

    return {
      success: payload.success,
      statusCode: payload.statusCode,
      message: payload.message,
      data: this.asRecord(payload.data),
    };
  }

  private asRecord(value: unknown): Record<string, unknown> {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      return {};
    }

    return value as Record<string, unknown>;
  }

  private isUpstreamResult(payload: unknown): payload is UpstreamResult<unknown> {
    if (!payload || typeof payload !== 'object') {
      return false;
    }

    const candidate = payload as UpstreamResult<unknown>;
    return (
      typeof candidate.success === 'boolean' &&
      typeof candidate.statusCode === 'number' &&
      typeof candidate.message === 'string'
    );
  }
}
