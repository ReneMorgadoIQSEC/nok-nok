import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { SpaFallbackMiddleware } from './spa.middleware';

@Module({})
export class SpaModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(SpaFallbackMiddleware).forRoutes({ path: '{*path}', method: RequestMethod.ALL });
  }
}
