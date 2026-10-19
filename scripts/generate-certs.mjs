import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync, spawnSync } from 'node:child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const certsDir = join(root, 'certs');
const certFile = join(certsDir, 'localhost.pem');
const keyFile = join(certsDir, 'localhost-key.pem');

function hasMkcert() {
  const result = spawnSync('mkcert', ['-help'], { stdio: 'ignore' });
  return result.status === 0;
}

function generateWithMkcert() {
  console.log('Generando certificados con mkcert…');
  try {
    execFileSync('mkcert', ['-install'], { stdio: 'inherit', cwd: root });
  } catch {
    console.warn(
      'No se pudo instalar la CA local de mkcert (puede requerir permisos). Continuando…',
    );
  }
  execFileSync(
    'mkcert',
    ['-cert-file', certFile, '-key-file', keyFile, 'localhost', '127.0.0.1', '::1'],
    { stdio: 'inherit', cwd: root },
  );
}

function generateWithOpenssl() {
  console.log('mkcert no disponible; generando certificado autofirmado con openssl…');
  execFileSync(
    'openssl',
    [
      'req',
      '-x509',
      '-newkey',
      'rsa:2048',
      '-sha256',
      '-days',
      '825',
      '-nodes',
      '-keyout',
      keyFile,
      '-out',
      certFile,
      '-subj',
      '/CN=localhost',
      '-addext',
      'subjectAltName=DNS:localhost,IP:127.0.0.1,IP:::1',
    ],
    { stdio: 'inherit', cwd: root },
  );
}

function writeEnvHint() {
  const hintPath = join(certsDir, 'README.md');
  writeFileSync(
    hintPath,
    [
      '# Certificados locales HTTPS',
      '',
      'Generados por `npm run certs` / `npm run dev`.',
      '',
      '- `localhost.pem` — certificado',
      '- `localhost-key.pem` — clave privada',
      '',
      'Con mkcert el navegador confía en localhost automáticamente.',
      'Con openssl puede que debas aceptar el aviso de certificado autofirmado.',
      '',
    ].join('\n'),
  );
}

mkdirSync(certsDir, { recursive: true });

if (existsSync(certFile) && existsSync(keyFile)) {
  // Validar que no estén vacíos
  if (readFileSync(certFile).length > 0 && readFileSync(keyFile).length > 0) {
    console.log(`Certificados ya existen en ${certsDir}`);
    process.exit(0);
  }
}

if (hasMkcert()) {
  generateWithMkcert();
} else {
  generateWithOpenssl();
}

writeEnvHint();
console.log(`Certificados listos en ${certsDir}`);
