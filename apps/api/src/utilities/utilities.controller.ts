import { BadRequestException, Controller, Post, Body } from '@nestjs/common';
import { UtilitiesService } from './utilities.service';

@Controller('utilities')
export class UtilitiesController {
  constructor(private readonly utilitiesService: UtilitiesService) {}

  @Post('send-code-email')
  sendCodeEmail(@Body() body: { email?: unknown }) {
    return this.utilitiesService.sendCodeEmail(this.requireText(body?.email, 'El correo es obligatorio'));
  }

  @Post('verify-code-email')
  verifyCodeEmail(@Body() body: { email?: unknown; code?: unknown }) {
    return this.utilitiesService.verifyCodeEmail(
      this.requireText(body?.email, 'El correo es obligatorio'),
      this.requireText(body?.code, 'El código es obligatorio'),
    );
  }

  private requireText(value: unknown, message: string) {
    if (typeof value !== 'string' || !value.trim()) {
      throw new BadRequestException(message);
    }
    return value.trim();
  }
}
