import { LoginResult, PasskeyLoginOptionsInput, ValidatePasskeyInput } from './auth.types';
export declare class AuthService {
    login(identityId: string, password: string): Promise<LoginResult>;
    getIdentityByEmail(email: string): Promise<LoginResult>;
    passkeyLoginOptions(input: PasskeyLoginOptionsInput): Promise<LoginResult>;
    validatePasskey(input: ValidatePasskeyInput): Promise<LoginResult>;
    private request;
    private toResult;
    private isLoginResult;
}
