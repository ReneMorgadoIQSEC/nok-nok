import { Injectable, NestMiddleware } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { existsSync } from 'fs';
import { join } from 'path';
import type { NextFunction, Request, Response } from 'express';

const API_PREFIXES = ['/api', '/fido', '/health', '/utilities'];

function resolveIndexHtml(configured?: string): string | null {
  const candidates = [
    configured ? join(configured, 'index.html') : null,
    join(__dirname, '..', '..', '..', 'web', 'dist', 'web', 'browser', 'index.html'),
    join(process.cwd(), '..', 'web', 'dist', 'web', 'browser', 'index.html'),
    join(process.cwd(), 'apps', 'web', 'dist', 'web', 'browser', 'index.html'),
  ].filter(Boolean) as string[];

  return candidates.find((path) => existsSync(path)) ?? null;
}

@Injectable()
export class SpaFallbackMiddleware implements NestMiddleware {
  private readonly indexHtml: string | null;

  constructor(config: ConfigService) {
    this.indexHtml = resolveIndexHtml(config.get<string>('WEB_DIST_PATH'));
  }

  use(req: Request, res: Response, next: NextFunction) {
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      return next();
    }

    if (API_PREFIXES.some((prefix) => req.path.startsWith(prefix))) {
      return next();
    }

    if (req.path.includes('.')) {
      return next();
    }

    if (!this.indexHtml) {
      return res.status(404).json({
        success: false,
        data: null,
        message: 'Angular build not found. Run npm run build:web first.',
      });
    }

    return res.sendFile(this.indexHtml);
  }
}
