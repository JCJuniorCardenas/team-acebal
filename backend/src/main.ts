import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AuthService } from './auth/auth.service';

const logger = new Logger('Bootstrap');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  const config = app.get(ConfigService);
  const adminEmail = config.get<string>('ADMIN_EMAIL');
  const adminPassword = config.get<string>('ADMIN_PASSWORD');
  if (adminEmail && adminPassword) {
    try {
      await app.get(AuthService).createAdmin(adminEmail, adminPassword);
      logger.log(`Usuario administrador verificado: ${adminEmail}`);
    } catch (error) {
      logger.error(
        'No se pudo crear/actualizar el usuario administrador al iniciar.',
        error,
      );
    }
  } else {
    logger.warn(
      'ADMIN_EMAIL / ADMIN_PASSWORD no configurados: no se creó ningún administrador.',
    );
  }

  const port = config.get<number>('PORT', 3000);
  await app.listen(port);
  logger.log(`Servidor escuchando en el puerto ${port}`);
}
void bootstrap();
