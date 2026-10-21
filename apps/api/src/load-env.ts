import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

function applyEnvFile(filePath: string) {
  const content = readFileSync(filePath, 'utf8');

  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }

    const separator = trimmed.indexOf('=');
    if (separator === -1) {
      continue;
    }

    const key = trimmed.slice(0, separator).trim();
    let value = trimmed.slice(separator + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (key && process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

export function loadEnv() {
  const candidates = [
    join(process.cwd(), '..', '..', '.env'),
    join(process.cwd(), '.env'),
    join(__dirname, '..', '..', '..', '.env'),
    join(__dirname, '..', '..', '.env'),
  ];

  const envFile = candidates.find((candidate) => existsSync(candidate));
  if (envFile) {
    applyEnvFile(envFile);
  }
}
