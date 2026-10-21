import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RegistrationController } from './registration/registration.controller';
import { RegistrationService } from './registration/registration.service';
import { UtilitiesController } from './utilities/utilities.controller';
import { UtilitiesService } from './utilities/utilities.service';

const isDev = process.env.NODE_ENV !== 'production';

function resolveAngularDist() {
  if (process.env.ANGULAR_DIST && existsSync(process.env.ANGULAR_DIST)) {
    return process.env.ANGULAR_DIST;
  }

  const candidates = [
    join(__dirname, '..', '..', 'web', 'dist', 'web', 'browser'),
    join(process.cwd(), '..', 'web', 'dist', 'web', 'browser'),
    join(process.cwd(), 'apps', 'web', 'dist', 'web', 'browser'),
  ];

  const found = candidates.find((path) => existsSync(path));
  if (!found && !isDev) {
    console.warn(
      '[static] No se encontró el build de Angular. Define ANGULAR_DIST o ejecuta npm run build.',
    );
  }
  return found ?? candidates[0];
}

@Module({
  imports: [
    ...(isDev
      ? []
      : [
          ServeStaticModule.forRoot({
            rootPath: resolveAngularDist(),
            exclude: ['/api/(.*)'],
          }),
        ]),
  ],
  controllers: [AppController, UtilitiesController, RegistrationController],
  providers: [AppService, UtilitiesService, RegistrationService],
})
export class AppModule {}
