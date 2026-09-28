import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AuthService } from './auth/auth.service';
import dataSource from './data-source';

const logger = new Logger('Bootstrap');

async function bootstrap() {
  // El esquema ya no usa synchronize en ningún entorno: las migraciones
  // corren siempre al arrancar, incluso en desarrollo.
  try {
    await dataSource.initialize();
    const migrations = await dataSource.runMigrations();
    logger.log(`Migraciones aplicadas: ${migrations.length}`);
  } catch (error) {
    logger.error(
      'No se pudieron aplicar las migraciones. El backend no iniciará.',
      error,
    );
    throw error;
  } finally {
    if (dataSource.isInitialized) await dataSource.destroy();
  }

  const app = await NestFactory.create(AppModule);

  const corsOrigins = (process.env.CORS_ORIGIN ?? '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
  if (corsOrigins.length === 0) {
    logger.warn(
      'CORS_ORIGIN no está configurado: se aceptará cualquier origen. Definilo en producción.',
    );
  }
  app.enableCors({ origin: corsOrigins.length > 0 ? corsOrigins : true });

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
