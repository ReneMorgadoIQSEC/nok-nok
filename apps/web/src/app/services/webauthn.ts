import { PasskeyCredential, PasskeyOptions } from '../interfaces/registration';

export function toCreationOptions(options: PasskeyOptions): PublicKeyCredentialCreationOptions {
  return {
    challenge: decodeBase64(options.challenge),
    rp: {
      id: options.rp.id,
      name: options.rp.name,
    },
    user: {
      id: decodeBase64(options.user.id),
      name: options.user.name,
      displayName: options.user.displayName,
    },
    pubKeyCredParams: options.pubKeyCredParams,
    timeout: options.timeout,
    authenticatorSelection: options.authenticatorSelection,
  };
}

export function serializeNewCredential(credential: PublicKeyCredential): PasskeyCredential {
  const response = credential.response;
  if (!(response instanceof AuthenticatorAttestationResponse)) {
    throw new Error('La credencial no incluye la atestación del passkey');
  }

  const rawId = encodeBase64(credential.rawId);
  return {
    id: rawId,
    rawId,
    type: credential.type,
    response: {
      attestationObject: encodeBase64(response.attestationObject),
      clientDataJSON: encodeBase64(response.clientDataJSON),
    },
  };
}

export function passkeyExceptionMessage(error: unknown): string {
  if (error instanceof DOMException) {
    if (error.name === 'NotAllowedError' || error.name === 'AbortError') {
      return 'Se canceló la creación del passkey. Puedes intentarlo de nuevo.';
    }
    if (error.name === 'InvalidStateError') {
      return 'Este dispositivo ya tiene un passkey para esta cuenta.';
    }
    if (error.name === 'NotSupportedError') {
      return 'Este navegador no puede crear un passkey.';
    }
    if (error.name === 'SecurityError') {
      return 'No se pudo crear el passkey en este sitio.';
    }
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message.trim();
  }

  return 'No logramos crear el passkey. Por favor, vuelve a intentarlo.';
}

function decodeBase64(value: string): ArrayBuffer {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padding = (4 - (normalized.length % 4)) % 4;
  const binary = atob(normalized.padEnd(normalized.length + padding, '='));
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes.buffer;
}

function encodeBase64(value: ArrayBuffer): string {
  const bytes = new Uint8Array(value);
  let binary = '';
  const chunkSize = 0x8000;

  for (let index = 0; index < bytes.length; index += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(index, index + chunkSize));
  }

  return btoa(binary);
}
