import { request as httpRequest } from 'node:http';
import { request as httpsRequest } from 'node:https';
import { BadGatewayException, Injectable, ServiceUnavailableException } from '@nestjs/common';
import { FacialCompareResult } from './facial.types';

const COMPARE_TIMEOUT_MS = 60_000;

@Injectable()
export class FacialService {
  compareImages(images: string[]): Promise<FacialCompareResult> {
    const url = process.env.FACIAL_API_URL?.trim();
    const apikey = process.env.FACIAL_API_KEY?.trim();
    if (!url || !apikey) {
      throw new ServiceUnavailableException('Faltan FACIAL_API_URL o FACIAL_API_KEY');
    }

    const payload = JSON.stringify({
      apikey,
      img_base64_ancla: images[0],
      imgs_base64: images,
      umbral_porcentaje: 0,
    });

    const target = new URL(url);
    const transport = target.protocol === 'http:' ? httpRequest : httpsRequest;

    return new Promise((resolve, reject) => {
      const req = transport(
        {
          protocol: target.protocol,
          hostname: target.hostname,
          port: target.port ? Number(target.port) : undefined,
          path: `${target.pathname}${target.search}`,
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            'Content-Length': Buffer.byteLength(payload),
            Connection: 'close',
          },
          timeout: COMPARE_TIMEOUT_MS,
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
        reject(new BadGatewayException('No fue posible contactar el servicio facial'));
      });
      req.on('error', () => {
        reject(new BadGatewayException('No fue posible contactar el servicio facial'));
      });
      req.write(payload);
      req.end();
    });
  }

  private toResult(raw: string): FacialCompareResult {
    const text = raw.trim();
    if (!text) {
      throw new BadGatewayException('El servicio facial respondió de forma inesperada');
    }

    let payload: unknown;
    try {
      payload = JSON.parse(text);
    } catch {
      throw new BadGatewayException('El servicio facial respondió de forma inesperada');
    }

    if (!this.isCompareResult(payload)) {
      throw new BadGatewayException('El servicio facial respondió de forma inesperada');
    }

    return payload;
  }

  private isCompareResult(payload: unknown): payload is FacialCompareResult {
    if (!payload || typeof payload !== 'object') {
      return false;
    }

    const result = payload as FacialCompareResult;
    return typeof result.estado === 'number' && typeof result.descripcion === 'string';
  }
}
