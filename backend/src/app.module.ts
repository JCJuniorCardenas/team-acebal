import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AlumnosModule } from './alumnos/alumnos.module';
import { GraduacionesModule } from './graduaciones/graduaciones.module';
import { PagosModule } from './pagos/pagos.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'db.sqlite',
      autoLoadEntities: true,
      synchronize: true, // Solo para desarrollo
    }),
    AlumnosModule,
    PagosModule,
    GraduacionesModule,
  ],
})
export class AppModule {}
