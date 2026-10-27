import { DeleteCredentialInput, LoginResult, PasskeyLoginOptionsInput, ValidatePasskeyInput } from './auth.types';
export declare class AuthService {
    login(identityId: string, password: string): Promise<LoginResult>;
    getIdentityByEmail(email: string): Promise<LoginResult>;
    passkeyLoginOptions(input: PasskeyLoginOptionsInput): Promise<LoginResult>;
    validatePasskey(input: ValidatePasskeyInput): Promise<LoginResult>;
    getCredentials(identityId: string): Promise<LoginResult>;
    deleteCredential(input: DeleteCredentialInput): Promise<LoginResult>;
    private request;
    private toResult;
    private isLoginResult;
}
