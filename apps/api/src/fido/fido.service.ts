import { Injectable } from '@nestjs/common';
import { ServiceResponse } from '../common/service-response';
import { ExternalHttpService } from '../external/external-http.service';
import { RegisterRequestDto } from './dto/register-request.dto';
import { RegisterResponseDto } from './dto/register-response.dto';

@Injectable()
export class FidoService {
  constructor(private readonly externalHttp: ExternalHttpService) {}

  registerRequest(dto: RegisterRequestDto): Promise<ServiceResponse> {
    return this.externalHttp.postToExternal('register-request', dto);
  }

  registerResponse(dto: RegisterResponseDto): Promise<ServiceResponse> {
    return this.externalHttp.postToExternal('register-response', dto);
  }
}
