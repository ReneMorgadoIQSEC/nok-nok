import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { createProxyServer } from 'http-proxy';
import { AppModule } from './app.module';
import { loadEnv } from './load-env';

loadEnv();

const isDev = process.env.NODE_ENV !== 'production';
const port = Number(process.env.PORT ?? (isDev ? 3443 : 3000));
const webOrigin = process.env.WEB_ORIGIN ?? 'http://127.0.0.1:4200';
const host = process.env.HOST ?? '0.0.0.0';

function resolveCertPath(fileName: string) {
  const fromEnv = fileName.endsWith('key.pem')
    ? process.env.SSL_KEY
    : process.env.SSL_CERT;
  if (fromEnv) {
    return fromEnv;
  }

  const candidates = [
    join(process.cwd(), 'certs', fileName),
    join(process.cwd(), '..', '..', 'certs', fileName),
    join(__dirname, '..', '..', '..', 'certs', fileName),
  ];

  return candidates.find((candidate) => existsSync(candidate));
}

/** HTTPS solo en local (dev) o si ENABLE_HTTPS=true. Railway/IIS terminan TLS afuera. */
function shouldUseHttps() {
  if (process.env.ENABLE_HTTPS === 'true') {
    return true;
  }
  if (process.env.ENABLE_HTTPS === 'false') {
    return false;
  }
  return isDev;
}

function loadHttpsOptions() {
  if (!shouldUseHttps()) {
    return undefined;
  }

  const certPath = resolveCertPath('localhost.pem');
  const keyPath = resolveCertPath('localhost-key.pem');

  if (!certPath || !keyPath) {
    throw new Error(
      'HTTPS habilitado pero no hay certificados en certs/. Ejecuta "npm run certs" o define SSL_CERT/SSL_KEY.',
    );
  }

  return {
    cert: readFileSync(certPath),
    key: readFileSync(keyPath),
  };
}

async function bootstrap() {
  const httpsOptions = loadHttpsOptions();
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    httpsOptions,
  });

  app.setGlobalPrefix('api');
  app.enableCors({ origin: true, credentials: true });
  app.set('trust proxy', 1);

  if (isDev) {
    const proxy = createProxyServer({
      target: webOrigin,
      changeOrigin: true,
      ws: true,
    });

    proxy.on('error', (error, _req, res) => {
      console.error('[proxy]', error.message);
      if (res && 'writeHead' in res && typeof res.writeHead === 'function') {
        res.writeHead(502, { 'Content-Type': 'text/plain' });
        res.end('Angular aún no está disponible');
      }
    });

    const expressApp = app.getHttpAdapter().getInstance();
    expressApp.use((req, res, next) => {
      if (req.url?.startsWith('/api')) {
        return next();
      }
      proxy.web(req, res);
    });

    await app.init();
    const server = await app.listen(port, host);

    server.on('upgrade', (req, socket, head) => {
      if (req.url?.startsWith('/api')) {
        socket.destroy();
        return;
      }
      proxy.ws(req, socket, head);
    });
  } else {
    await app.listen(port, host);
  }

  const protocol = httpsOptions ? 'https' : 'http';
  console.log(`Nok Nok escuchando en ${protocol}://${host}:${port}`);
  console.log(`API: ${protocol}://${host}:${port}/api`);
}

void bootstrap();
