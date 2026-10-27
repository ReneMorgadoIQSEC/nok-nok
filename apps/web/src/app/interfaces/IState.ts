export enum ERegisterStep {
  Start = 'start',
  VerificationCode = 'verification-code',
  Passkey = 'passkey',
  LifeTest = 'life-test',
}

export enum ELoginStep {
  Start = 'start',
  Password = 'password',
}

export enum EAuthenticatedPages {
  Home = "home",
  Account = 'account',
  Landing = 'landing',
}

export const REGISTER_STEPS: readonly ERegisterStep[] = [
  ERegisterStep.Start,
  ERegisterStep.VerificationCode,
  ERegisterStep.Passkey,
  ERegisterStep.LifeTest,
];

export const LOGIN_STEPS: readonly ELoginStep[] = [ELoginStep.Start, ELoginStep.Password];

export interface State {
  registerStep: ERegisterStep;
  loginStep: ELoginStep;
  authenticated: boolean;
  modalData: ModalData | null;
  email: string;
  fullName: string;
  phoneNumber: string;
  password: string;
  identityId: string;
  deviceId: string;
  userId: string;
}

export interface ModalData {
  show: boolean;
  imageSize?: 'small' | 'large';
  closeable?: boolean;
  image?: string;
  title?: string;
  description?: string;
  buttonText?: string;
  buttonAction?: () => void;
}