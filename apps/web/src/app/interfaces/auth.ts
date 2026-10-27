const SESSION_KEY = 'nok-nok.session';

export interface Session {
  token: string;
  identityId: string;
  email: string;
}

export interface StoredCredential {
  identityId: string;
  fidoCredentialId: string;
  dateCreate: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

export function loginIdentityFromResult(
  payload: unknown,
): { identityId: string; deviceId: string } | null {
  if (!isRecord(payload) || payload['success'] !== true || !isRecord(payload['data'])) {
    return null;
  }

  const identity = payload['data']['identityId'];
  if (!isRecord(identity)) {
    return null;
  }

  const identityId = identity['identityId'];
  const deviceId = identity['deviceId'];
  if (typeof identityId !== 'string' || !identityId.trim()) {
    return null;
  }
  if (typeof deviceId !== 'string' || !deviceId.trim()) {
    return null;
  }

  return { identityId: identityId.trim(), deviceId: deviceId.trim() };
}

export interface PasskeyLoginOptions {
  challenge: string;
  identityId: string;
  rpId: string;
  timeout: number;
  userVerification: UserVerificationRequirement;
  allowCredentials: { type: 'public-key'; id: string }[];
}

export function passkeyLoginOptionsFromResult(payload: unknown): PasskeyLoginOptions | null {
  if (!isRecord(payload) || payload['success'] !== true || !isRecord(payload['data'])) {
    return null;
  }

  const options = payload['data']['options'];
  if (!isRecord(options)) {
    return null;
  }

  const challenge = readText(options, 'challenge');
  const rpId = readText(options, 'rpid') ?? readText(options, 'rpId');
  const allowCredentials = readAllowCredentials(options['allowCredentials']);
  if (!challenge || !rpId || !allowCredentials) {
    return null;
  }

  const userVerification = options['userVerification'];
  const timeout = options['timeout'];

  return {
    challenge,
    identityId: readText(options, 'identityId') ?? '',
    rpId,
    timeout: typeof timeout === 'number' && timeout > 0 ? timeout : 120_000,
    userVerification: isUserVerification(userVerification) ? userVerification : 'required',
    allowCredentials,
  };
}

function readText(record: Record<string, unknown>, key: string): string | null {
  const value = record[key];
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function readAllowCredentials(value: unknown): { type: 'public-key'; id: string }[] | null {
  if (value == null) {
    return [];
  }
  if (!Array.isArray(value)) {
    return null;
  }

  const credentials = value.flatMap((item) => {
    if (!isRecord(item) || item['type'] !== 'public-key') {
      return [];
    }
    const id = item['id'];
    if (typeof id !== 'string' || !id.trim()) {
      return [];
    }
    return [{ type: 'public-key' as const, id: id.trim() }];
  });

  return value.length > 0 && credentials.length === 0 ? null : credentials;
}

function isUserVerification(value: unknown): value is UserVerificationRequirement {
  return value === 'required' || value === 'preferred' || value === 'discouraged';
}

export function credentialsFromResult(payload: unknown): StoredCredential[] | null {
  if (!isRecord(payload) || payload['success'] !== true || !isRecord(payload['data'])) {
    return null;
  }

  const credentials = payload['data']['credentials'];
  if (!Array.isArray(credentials)) {
    return null;
  }

  return credentials.flatMap((item) => {
    if (!isRecord(item)) {
      return [];
    }
    const fidoCredentialId = readText(item, 'fidoCredentialId');
    if (!fidoCredentialId) {
      return [];
    }
    return [
      {
        identityId: readText(item, 'identityId') ?? '',
        fidoCredentialId,
        dateCreate: readText(item, 'dateCreate') ?? '',
      },
    ];
  });
}

export function tokenFromResult(payload: unknown): string | null {
  if (!isRecord(payload) || payload['success'] !== true || !isRecord(payload['data'])) {
    return null;
  }

  const token = payload['data']['token'];
  return typeof token === 'string' && token.trim() ? token.trim() : null;
}

export function readSession(): Session | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) {
      return null;
    }

    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed) || typeof parsed['token'] !== 'string' || !parsed['token'].trim()) {
      return null;
    }

    return {
      token: parsed['token'].trim(),
      identityId: typeof parsed['identityId'] === 'string' ? parsed['identityId'].trim() : '',
      email: typeof parsed['email'] === 'string' ? parsed['email'].trim() : '',
    };
  } catch {
    return null;
  }
}

export function writeSession(session: Session) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}
