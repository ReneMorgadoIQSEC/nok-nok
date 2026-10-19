import { Body, Controller, Post } from '@nestjs/common';
import { RegisterRequestDto } from './dto/register-request.dto';
import { RegisterResponseDto } from './dto/register-response.dto';
import { FidoService } from './fido.service';

@Controller('fido')
export class FidoController {
  constructor(private readonly fidoService: FidoService) {}

  @Post('register-request')
  registerRequest(@Body() body: RegisterRequestDto) {
    return this.fidoService.registerRequest(body);
  }

  @Post('register-response')
  registerResponse(@Body() body: RegisterResponseDto) {
    return this.fidoService.registerResponse(body);
  }
}
