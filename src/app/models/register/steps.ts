export enum RegisterSteps {
    DATA = 'data',
    PASSKEY = 'passkey',
    OTP = 'otp',
    ASK_ANTISPOOFING = 'askAntispoofing',
    ANTISPOOFING = 'antispoofing',
}

export interface RegisterData {
    data: DataStep;
    passkey: PasskeyStep;
    otp: OtpStep;
    askAntispoofing: AskAntispoofingStep;
    antispoofing: AntispoofingStep;
    currentStep: RegisterSteps;
}

export interface DataStep {
    name: string;
    email: string;
    phone?: string;
    completed: boolean;
}

export interface PasskeyStep {
    completed: boolean;
}

export interface OtpStep {
    verified: boolean;
    completed: boolean;
}

export interface AskAntispoofingStep {
    chosenAntispoofing: boolean;
    completed: boolean;
}

export interface AntispoofingStep {
    verified: boolean;
    completed: boolean;
}