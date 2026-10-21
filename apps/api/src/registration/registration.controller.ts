import { BadRequestException, Body, Controller, Post } from '@nestjs/common';
import { RegistrationService } from './registration.service';
import { RegisterPasskeyInput } from './registration.types';

@Controller('registration')
export class RegistrationController {
  constructor(private readonly registrationService: RegistrationService) {}

  @Post('identity')
  createIdentity(
    @Body()
    body: { browserName?: unknown; browserVersion?: unknown; os?: unknown },
  ) {
    return this.registrationService.createIdentity({
      browserName: this.requireText(body?.browserName, 'El navegador es obligatorio'),
      browserVersion: this.requireText(body?.browserVersion, 'La versión del navegador es obligatoria'),
      os: this.requireText(body?.os, 'El sistema operativo es obligatorio'),
    });
  }

  @Post('user')
  registerUser(
    @Body()
    body: {
      identityId?: unknown;
      fullName?: unknown;
      email?: unknown;
      phoneNumber?: unknown;
      password?: unknown;
      deviceId?: unknown;
    },
  ) {
    return this.registrationService.registerUser({
      identityId: this.requireText(body?.identityId, 'La identidad es obligatoria'),
      fullName: this.requireText(body?.fullName, 'El nombre es obligatorio'),
      email: this.requireText(body?.email, 'El correo es obligatorio'),
      phoneNumber: typeof body?.phoneNumber === 'string' ? body.phoneNumber.trim() : '',
      password: this.requireSecret(body?.password, 'La contraseña es obligatoria'),
      deviceId: this.requireText(body?.deviceId, 'El dispositivo es obligatorio'),
    });
  }

  @Post('passkey/options')
  passkeyOptions(
    @Body()
    body: { identityId?: unknown; email?: unknown; displayName?: unknown },
  ) {
    return this.registrationService.passkeyOptions({
      identityId: this.requireText(body?.identityId, 'La identidad es obligatoria'),
      email: this.requireText(body?.email, 'El correo es obligatorio'),
      displayName: this.requireText(body?.displayName, 'El nombre es obligatorio'),
    });
  }

  @Post('passkey')
  registerPasskey(@Body() body: { credential?: unknown; challenge?: unknown; identityId?: unknown }) {
    return this.registrationService.registerPasskey({
      credential: this.requireCredential(body?.credential),
      challenge: this.requireText(body?.challenge, 'El challenge es obligatorio'),
      identityId: this.requireText(body?.identityId, 'La identidad es obligatoria'),
    });
  }

  private requireText(value: unknown, message: string) {
    if (typeof value !== 'string' || !value.trim()) {
      throw new BadRequestException(message);
    }
    return value.trim();
  }

  private requireSecret(value: unknown, message: string) {
    if (typeof value !== 'string' || !value) {
      throw new BadRequestException(message);
    }
    return value;
  }

  private requireCredential(value: unknown): RegisterPasskeyInput['credential'] {
    if (!value || typeof value !== 'object') {
      throw new BadRequestException('La credencial es obligatoria');
    }

    const credential = value as {
      id?: unknown;
      rawId?: unknown;
      type?: unknown;
      response?: { attestationObject?: unknown; clientDataJSON?: unknown };
    };
    const response = credential.response;

    if (!response || typeof response !== 'object') {
      throw new BadRequestException('La credencial es obligatoria');
    }

    return {
      id: this.requireText(credential.id, 'La credencial es obligatoria'),
      rawId: this.requireText(credential.rawId, 'La credencial es obligatoria'),
      type: this.requireText(credential.type, 'La credencial es obligatoria'),
      response: {
        attestationObject: this.requireText(
          response.attestationObject,
          'La credencial es obligatoria',
        ),
        clientDataJSON: this.requireText(response.clientDataJSON, 'La credencial es obligatoria'),
      },
    };
  }
}
