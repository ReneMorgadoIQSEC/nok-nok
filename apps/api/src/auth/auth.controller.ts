import { BadRequestException, Body, Controller, Get, HttpCode, Post, Query } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ValidatePasskeyInput } from './auth.types';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('identity')
  identity(@Query('email') email?: unknown) {
    return this.authService.getIdentityByEmail(this.requireText(email, 'El correo es obligatorio'));
  }

  @Post('passkey/options')
  @HttpCode(200)
  passkeyOptions(@Body() body: { identityId?: unknown; email?: unknown }) {
    return this.authService.passkeyLoginOptions({
      identityId: this.requireText(body?.identityId, 'La identidad es obligatoria'),
      email: this.requireText(body?.email, 'El correo es obligatorio'),
    });
  }

  @Post('passkey')
  @HttpCode(200)
  validatePasskey(@Body() body: { credential?: unknown; challenge?: unknown; identityId?: unknown }) {
    return this.authService.validatePasskey({
      credential: this.requireCredential(body?.credential),
      challenge: this.requireText(body?.challenge, 'El challenge es obligatorio'),
      identityId: this.requireText(body?.identityId, 'La identidad es obligatoria'),
    });
  }

  @Post('login')
  @HttpCode(200)
  login(@Body() body: { identityId?: unknown; password?: unknown }) {
    return this.authService.login(
      this.requireText(body?.identityId, 'La identidad es obligatoria'),
      this.requireSecret(body?.password, 'La contraseña es obligatoria'),
    );
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

  private requireCredential(value: unknown): ValidatePasskeyInput['credential'] {
    if (!value || typeof value !== 'object') {
      throw new BadRequestException('La credencial es obligatoria');
    }

    const credential = value as {
      id?: unknown;
      rawId?: unknown;
      type?: unknown;
      response?: { authenticatorData?: unknown; clientDataJSON?: unknown; signature?: unknown };
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
        authenticatorData: this.requireText(response.authenticatorData, 'La credencial es obligatoria'),
        clientDataJSON: this.requireText(response.clientDataJSON, 'La credencial es obligatoria'),
        signature: this.requireText(response.signature, 'La credencial es obligatoria'),
      },
    };
  }
}
