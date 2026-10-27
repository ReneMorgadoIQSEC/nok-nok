import { AuthService } from './auth.service';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    identity(email?: unknown): Promise<import("./auth.types").LoginResult>;
    passkeyOptions(body: {
        identityId?: unknown;
        email?: unknown;
    }): Promise<import("./auth.types").LoginResult>;
    validatePasskey(body: {
        credential?: unknown;
        challenge?: unknown;
        identityId?: unknown;
    }): Promise<import("./auth.types").LoginResult>;
    credentials(identityId?: unknown): Promise<import("./auth.types").LoginResult>;
    deleteCredential(body: {
        identityId?: unknown;
        fidoCredentialId?: unknown;
    }): Promise<import("./auth.types").LoginResult>;
    login(body: {
        identityId?: unknown;
        password?: unknown;
    }): Promise<import("./auth.types").LoginResult>;
    private requireText;
    private requireSecret;
    private requireCredential;
}
