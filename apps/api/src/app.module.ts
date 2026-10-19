import { join } from 'path';
import { existsSync } from 'fs';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ExternalModule } from './external/external.module';
import { FidoModule } from './fido/fido.module';
import { HealthModule } from './health/health.module';
import { SpaModule } from './spa/spa.module';
import { UtilitiesModule } from './utilities/utilities.module';

function resolveWebDistPath(configured?: string): string {
  if (configured && existsSync(configured)) {
    return configured;
  }

  const candidates = [
    join(__dirname, '..', '..', 'web', 'dist', 'web', 'browser'),
    join(process.cwd(), '..', 'web', 'dist', 'web', 'browser'),
    join(process.cwd(), 'apps', 'web', 'dist', 'web', 'browser'),
  ];

  return candidates.find((path) => existsSync(path)) ?? candidates[0];
}

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', join(__dirname, '..', '.env')],
    }),
    ServeStaticModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const rootPath = resolveWebDistPath(config.get<string>('WEB_DIST_PATH'));
        return [
          {
            rootPath,
            exclude: ['/api*', '/fido*', '/health*', '/utilities*'],
            serveStaticOptions: {
              fallthrough: true,
            },
          },
        ];
      },
    }),
    ExternalModule,
    FidoModule,
    UtilitiesModule,
    HealthModule,
    SpaModule,
  ],
})
export class AppModule {}


