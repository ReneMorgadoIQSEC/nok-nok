export interface LoginResult {
  success: boolean;
  statusCode: number;
  message: string;
  data: Record<string, unknown>;
}

export interface PasskeyLoginOptionsInput {
  identityId: string;
  email: string;
}

export interface ValidatePasskeyInput {
  credential: {
    id: string;
    rawId: string;
    type: string;
    response: {
      authenticatorData: string;
      clientDataJSON: string;
      signature: string;
    };
  };
  challenge: string;
  identityId: string;
}
