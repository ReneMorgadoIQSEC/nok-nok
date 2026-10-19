import { Module } from '@nestjs/common';
import { FidoController } from './fido.controller';
import { FidoService } from './fido.service';

@Module({
  controllers: [FidoController],
  providers: [FidoService],
})
export class FidoModule {}
