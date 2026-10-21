import { CreateIdentityInput, PasskeyOptionsInput, RegisterPasskeyInput, RegisterUserInput, UpstreamResult } from './registration.types';
export declare class RegistrationService {
    createIdentity(input: CreateIdentityInput): Promise<UpstreamResult<Record<string, unknown>>>;
    registerUser(input: RegisterUserInput): Promise<UpstreamResult<Record<string, unknown>>>;
    passkeyOptions(input: PasskeyOptionsInput): Promise<UpstreamResult<Record<string, unknown>>>;
    registerPasskey(input: RegisterPasskeyInput): Promise<UpstreamResult<Record<string, unknown>>>;
    private post;
    private toResult;
    private asRecord;
    private isUpstreamResult;
}
