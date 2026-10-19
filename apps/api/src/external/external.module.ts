import { HttpModule } from '@nestjs/axios';
import { Global, Module } from '@nestjs/common';
import { ExternalHttpService } from './external-http.service';

@Global()
@Module({
  imports: [
    HttpModule.register({
      timeout: 15000,
      maxRedirects: 3,
    }),
  ],
  providers: [ExternalHttpService],
  exports: [ExternalHttpService],
})
export class ExternalModule {}
