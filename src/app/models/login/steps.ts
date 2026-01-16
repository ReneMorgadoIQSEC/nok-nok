export enum LoginSteps {
    START = 'start',
    PASSWORD = 'password',
}

export interface LoginData {
    start: StartStep;
    password: PasswordStep;
    currentStep: LoginSteps;
}

export interface StartStep {
    email: string;
    completed: boolean;
}

export interface PasswordStep {
    password: string;
    completed: boolean;
}
