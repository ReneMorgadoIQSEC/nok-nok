import { Injectable } from '@nestjs/common';
import { ServiceResponse } from '../common/service-response';
import { ExternalHttpService } from '../external/external-http.service';
import { SendCodeEmailDto } from './dto/send-code-email.dto';
import { VerifyCodeEmailDto } from './dto/verify-code-email.dto';

@Injectable()
export class UtilitiesService {
  constructor(private readonly externalHttp: ExternalHttpService) {}

  sendCodeEmail(dto: SendCodeEmailDto): Promise<ServiceResponse> {
    return this.externalHttp.postToExternal('SendCodeEmail', dto, 'EXTERNAL_UTILITIES_BASE_URL');
  }

  verifyCodeEmail(dto: VerifyCodeEmailDto): Promise<ServiceResponse> {
    return this.externalHttp.postToExternal('VerifyCodeEmail', dto, 'EXTERNAL_UTILITIES_BASE_URL');
  }
}
