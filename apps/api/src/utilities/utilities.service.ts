import { request as httpRequest } from 'node:http';
import { request as httpsRequest } from 'node:https';
import { BadGatewayException, Injectable, ServiceUnavailableException } from '@nestjs/common';
import { UtilitiesResult } from './utilities.types';

@Injectable()
export class UtilitiesService {
  sendCodeEmail(email: string) {
    return this.post('/Utilities/SendCodeEmail', { email });
  }

  verifyCodeEmail(email: string, code: string) {
    return this.post('/Utilities/VerifyCodeEmail', { email, code });
  }

  private post(path: string, body: Record<string, string>): Promise<UtilitiesResult> {
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
          timeout: 20_000,
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
        reject(new BadGatewayException('No fue posible contactar el servicio de verificación'));
      });
      req.on('error', () => {
        reject(new BadGatewayException('No fue posible contactar el servicio de verificación'));
      });
      req.write(payload);
      req.end();
    });
  }

  private toResult(raw: string): UtilitiesResult {
    const text = raw.trim();
    if (!text) {
      throw new BadGatewayException('El servicio de verificación respondió de forma inesperada');
    }

    let payload: unknown;
    try {
      payload = JSON.parse(text);
    } catch {
      throw new BadGatewayException('El servicio de verificación respondió de forma inesperada');
    }

    if (typeof payload === 'string' && payload.trim()) {
      const descripcion = payload.trim();
      return {
        success: false,
        statusCode: 0,
        message: descripcion,
        data: { estado: -1, descripcion },
      };
    }

    if (this.isUtilitiesResult(payload)) {
      return payload;
    }

    throw new BadGatewayException('El servicio de verificación respondió de forma inesperada');
  }

  private isUtilitiesResult(payload: unknown): payload is UtilitiesResult {
    if (!payload || typeof payload !== 'object') {
      return false;
    }

    const data = (payload as UtilitiesResult).data;
    return !!data && typeof data.estado === 'number';
  }
}
