import { RegistrationService } from './registration.service';
export declare class RegistrationController {
    private readonly registrationService;
    constructor(registrationService: RegistrationService);
    createIdentity(body: {
        browserName?: unknown;
        browserVersion?: unknown;
        os?: unknown;
    }): Promise<import("./registration.types").UpstreamResult<Record<string, unknown>>>;
    registerUser(body: {
        identityId?: unknown;
        fullName?: unknown;
        email?: unknown;
        phoneNumber?: unknown;
        password?: unknown;
        deviceId?: unknown;
    }): Promise<import("./registration.types").UpstreamResult<Record<string, unknown>>>;
    passkeyOptions(body: {
        identityId?: unknown;
        email?: unknown;
        displayName?: unknown;
    }): Promise<import("./registration.types").UpstreamResult<Record<string, unknown>>>;
    registerPasskey(body: {
        credential?: unknown;
        challenge?: unknown;
        identityId?: unknown;
    }): Promise<import("./registration.types").UpstreamResult<Record<string, unknown>>>;
    private requireText;
    private requireSecret;
    private requireCredential;
}
