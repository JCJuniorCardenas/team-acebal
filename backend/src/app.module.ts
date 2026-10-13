import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AlumnosModule } from './alumnos/alumnos.module';
import { AuthModule } from './auth/auth.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { GraduacionesModule } from './graduaciones/graduaciones.module';
import { HealthModule } from './health/health.module';
import { PagosModule } from './pagos/pagos.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 60 }]),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        url: config.get<string>('DATABASE_URL'),
        host: config.get<string>('DB_HOST', 'localhost'),
        port: config.get<number>('DB_PORT', 5432),
        username: config.get<string>('DB_USERNAME', 'postgres'),
        password: config.get<string>('DB_PASSWORD', 'postgres'),
        database: config.get<string>('DB_NAME', 'team_acebal'),
        autoLoadEntities: true,
        synchronize: false, // El esquema se maneja siempre por migraciones
        ssl: config.get<string>('DATABASE_URL')
          ? { rejectUnauthorized: true }
          : false,
        // Neon suspende la base tras ~5 min sin uso: la primera conexión puede
        // tardar o fallar, así que se reintenta al arrancar.
        retryAttempts: 5,
        retryDelay: 3000,
        connectTimeoutMS: 15000,
        extra: {
          connectionTimeoutMillis: 15000,
          // Cerrar conexiones inactivas antes de que Neon las corte por su lado.
          idleTimeoutMillis: 30000,
          keepAlive: true,
          max: 5,
        },
      }),
    }),
    AuthModule,
    AlumnosModule,
    PagosModule,
    GraduacionesModule,
    DashboardModule,
    HealthModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
