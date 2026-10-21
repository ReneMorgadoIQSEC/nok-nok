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

export interface CreateIdentityInput {
  browserName: string;
  browserVersion: string;
  os: string;
}

export interface RegisterUserInput {
  identityId: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  password: string;
  deviceId: string;
}

export interface PasskeyOptionsInput {
  identityId: string;
  email: string;
  displayName: string;
}

export interface RegisterPasskeyInput {
  credential: {
    id: string;
    rawId: string;
    type: string;
    response: {
      attestationObject: string;
      clientDataJSON: string;
    };
  };
  challenge: string;
  identityId: string;
}
