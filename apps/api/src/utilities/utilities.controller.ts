import { Body, Controller, Post } from '@nestjs/common';
import { SendCodeEmailDto } from './dto/send-code-email.dto';
import { VerifyCodeEmailDto } from './dto/verify-code-email.dto';
import { UtilitiesService } from './utilities.service';

@Controller('utilities')
export class UtilitiesController {
  constructor(private readonly utilitiesService: UtilitiesService) {}

  @Post('send-code-email')
  sendCodeEmail(@Body() body: SendCodeEmailDto) {
    return this.utilitiesService.sendCodeEmail(body);
  }

  @Post('verify-code-email')
  verifyCodeEmail(@Body() body: VerifyCodeEmailDto) {
    return this.utilitiesService.verifyCodeEmail(body);
  }
}
