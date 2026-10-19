import { Controller, Get } from '@nestjs/common';
import { ok } from '../common/service-response';

@Controller('health')
export class HealthController {
  @Get()
  check() {
    return ok({ status: 'up' }, 'API is healthy');
  }
}
