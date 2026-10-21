export interface UpstreamResult<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
}

export interface IdentityData {
  identityId: string;
  deviceId: string;
}

export interface UserData {
  userId: string;
}

export interface PasskeyOptions {
  challenge: string;
  identityId: string;
  rp: {
    id: string;
    name: string;
  };
  user: {
    id: string;
    name: string;
    displayName: string;
  };
  pubKeyCredParams: PublicKeyCredentialParameters[];
  timeout: number;
  authenticatorSelection: AuthenticatorSelectionCriteria;
}

export interface PasskeyCredential {
  id: string;
  rawId: string;
  type: string;
  response: {
    attestationObject: string;
    clientDataJSON: string;
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

function readText(record: Record<string, unknown>, key: string): string | null {
  const value = record[key];
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

export function registrationErrorMessage(payload: unknown, fallback: string): string | null {
  if (!isRecord(payload)) {
    return fallback;
  }

  if (payload['success'] === true) {
    return null;
  }

  const message = payload['message'];
  if (typeof message === 'string' && message.trim()) {
    return message.trim();
  }

  if (Array.isArray(message)) {
    const first = message.find((item) => typeof item === 'string' && item.trim());
    if (typeof first === 'string') {
      return first.trim();
    }
  }

  return fallback;
}

export function identityFromResult(payload: unknown): IdentityData | null {
  if (!isRecord(payload) || payload['success'] !== true || !isRecord(payload['data'])) {
    return null;
  }

  const identityId = readText(payload['data'], 'identityId');
  const deviceId = readText(payload['data'], 'deviceId');
  if (!identityId || !deviceId) {
    return null;
  }

  return { identityId, deviceId };
}

export function userIdFromResult(payload: unknown): string | null {
  if (!isRecord(payload) || payload['success'] !== true || !isRecord(payload['data'])) {
    return null;
  }

  return readText(payload['data'], 'userId');
}

export function passkeyOptionsFromResult(payload: unknown): PasskeyOptions | null {
  if (!isRecord(payload) || payload['success'] !== true || !isRecord(payload['data'])) {
    return null;
  }

  const options = payload['data']['options'];
  if (!isRecord(options) || !isRecord(options['rp']) || !isRecord(options['user'])) {
    return null;
  }

  const challenge = readText(options, 'challenge');
  const rpId = readText(options['rp'], 'id');
  const rpName = readText(options['rp'], 'name');
  const userId = readText(options['user'], 'id');
  const userName = readText(options['user'], 'name');
  const displayName = readText(options['user'], 'displayName');
  const pubKeyCredParams = readAlgorithms(options['pubKeyCredParams']);
  const authenticatorSelection = readAuthenticatorSelection(options['authenticatorSelection']);

  if (
    !challenge ||
    !rpId ||
    !rpName ||
    !userId ||
    !userName ||
    !displayName ||
    !pubKeyCredParams ||
    !authenticatorSelection
  ) {
    return null;
  }

  const timeout = options['timeout'];

  return {
    challenge,
    identityId: readText(options, 'identityId') ?? '',
    rp: { id: rpId, name: rpName },
    user: { id: userId, name: userName, displayName },
    pubKeyCredParams,
    timeout: typeof timeout === 'number' && timeout > 0 ? timeout : 120_000,
    authenticatorSelection,
  };
}

function readAlgorithms(value: unknown): PublicKeyCredentialParameters[] | null {
  if (!Array.isArray(value)) {
    return null;
  }

  const algorithms = value.flatMap((item) => {
    if (!isRecord(item) || item['type'] !== 'public-key' || typeof item['alg'] !== 'number') {
      return [];
    }
    return [{ type: 'public-key' as const, alg: item['alg'] }];
  });

  return algorithms.length ? algorithms : null;
}

function readAuthenticatorSelection(value: unknown): AuthenticatorSelectionCriteria | null {
  if (!isRecord(value)) {
    return null;
  }

  const residentKey = value['residentKey'];
  const userVerification = value['userVerification'];
  if (!isResidentKey(residentKey) || !isUserVerification(userVerification)) {
    return null;
  }

  return {
    residentKey,
    requireResidentKey: value['requireResidentKey'] === true || residentKey === 'required',
    userVerification,
  };
}

function isResidentKey(value: unknown): value is ResidentKeyRequirement {
  return value === 'required' || value === 'preferred' || value === 'discouraged';
}

function isUserVerification(value: unknown): value is UserVerificationRequirement {
  return value === 'required' || value === 'preferred' || value === 'discouraged';
}
