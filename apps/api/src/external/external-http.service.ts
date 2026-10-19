import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AxiosRequestConfig } from 'axios';
import { firstValueFrom } from 'rxjs';
import { fail, ok, ServiceResponse } from '../common/service-response';

@Injectable()
export class ExternalHttpService {
  private readonly logger = new Logger(ExternalHttpService.name);

  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
  ) {}

  async postToExternal<T = unknown>(
    path: string,
    body: unknown,
    baseUrlEnv = 'EXTERNAL_FIDO_BASE_URL',
  ): Promise<ServiceResponse<T>> {
    const baseUrl = this.config.get<string>(baseUrlEnv)?.trim();

    if (!baseUrl || baseUrl.includes('example.com')) {
      this.logger.warn(`${baseUrlEnv} is not configured; returning stub response for ${path}`);
      return ok({ stub: true, path } as T, `External service not configured (${path})`);
    }

    const url = `${baseUrl.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
    const apiKey = this.config.get<string>('EXTERNAL_API_KEY');

    const requestConfig: AxiosRequestConfig = {
      headers: {
        'Content-Type': 'application/json',
        ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
      },
    };

    try {
      const { data } = await firstValueFrom(this.http.post<ServiceResponse<T> | T>(url, body, requestConfig));

      if (data && typeof data === 'object' && 'success' in (data as object)) {
        return data as ServiceResponse<T>;
      }

      return ok(data as T);
    } catch (error: unknown) {
      const message = this.extractErrorMessage(error);
      this.logger.error(`External call failed [${url}]: ${message}`);
      return fail(message) as ServiceResponse<T>;
    }
  }

  private extractErrorMessage(error: unknown): string {
    if (typeof error === 'object' && error !== null && 'response' in error) {
      const response = (
        error as {
          response?: {
            data?: { message?: string; Message?: string; error?: string; title?: string };
            status?: number;
          };
        }
      ).response;
      const data = response?.data;
      if (data?.message) return data.message;
      if (data?.Message) return data.Message;
      if (data?.error) return data.error;
      if (data?.title) return data.title;
      if (response?.status) return `External service error (${response.status})`;
    }

    if (error instanceof Error) return error.message;
    return 'Unexpected external service error';
  }
}

