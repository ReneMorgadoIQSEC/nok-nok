import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createConnection } from 'node:net';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const certFile = join(root, 'certs', 'localhost.pem');
const keyFile = join(root, 'certs', 'localhost-key.pem');

const WEB_PORT = Number(process.env.WEB_PORT ?? 4200);
const API_PORT = Number(process.env.PORT ?? 3443);

function run(command, args, options = {}) {
  const child = spawn(command, args, {
    cwd: root,
    stdio: 'inherit',
    shell: process.platform === 'win32',
    env: { ...process.env, ...options.env },
    ...options,
  });
  child.on('exit', (code, signal) => {
    if (signal) {
      process.kill(process.pid, signal);
      return;
    }
    if (code && code !== 0) {
      shutdown(code);
    }
  });
  return child;
}

function waitForPort(port, host = '127.0.0.1', timeoutMs = 120_000) {
  const started = Date.now();
  return new Promise((resolve, reject) => {
    const tryConnect = () => {
      const socket = createConnection({ port, host }, () => {
        socket.end();
        resolve();
      });
      socket.on('error', () => {
        socket.destroy();
        if (Date.now() - started > timeoutMs) {
          reject(new Error(`Timeout esperando ${host}:${port}`));
          return;
        }
        setTimeout(tryConnect, 400);
      });
    };
    tryConnect();
  });
}

const children = [];

function shutdown(code = 0) {
  for (const child of children) {
    if (!child.killed) {
      child.kill('SIGTERM');
    }
  }
  process.exit(code);
}

process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));

async function main() {
  if (!existsSync(certFile) || !existsSync(keyFile)) {
    console.log('Generando certificados HTTPS…');
    await new Promise((resolve, reject) => {
      const certs = run(process.execPath, [join(root, 'scripts', 'generate-certs.mjs')]);
      children.push(certs);
      certs.on('exit', (code) => {
        if (code === 0) resolve();
        else reject(new Error('Fallo al generar certificados'));
      });
    });
    children.length = 0;
  }

  console.log(`\n→ Angular (interno) http://127.0.0.1:${WEB_PORT}`);
  const web = run('npm', ['run', 'start', '--workspace=@nok-nok/web', '--', '--host', '127.0.0.1', '--port', String(WEB_PORT)], {
    env: {
      ...process.env,
    },
  });
  children.push(web);

  await waitForPort(WEB_PORT);
  console.log(`\n→ Nest HTTPS https://localhost:${API_PORT}`);
  console.log(`   API:  https://localhost:${API_PORT}/api`);
  console.log(`   Web:  https://localhost:${API_PORT}/\n`);

  const api = run('npm', ['run', 'start:dev', '--workspace=@nok-nok/api'], {
    env: {
      ...process.env,
      PORT: String(API_PORT),
      WEB_ORIGIN: `http://127.0.0.1:${WEB_PORT}`,
      NODE_ENV: 'development',
      SSL_CERT: certFile,
      SSL_KEY: keyFile,
    },
  });
  children.push(api);
}

main().catch((error) => {
  console.error(error);
  shutdown(1);
});
