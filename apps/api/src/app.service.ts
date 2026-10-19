import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Nok Nok API';
  }

  getHealth() {
    return {
      status: 'ok',
      service: 'nok-nok-api',
      timestamp: new Date().toISOString(),
    };
  }
}
