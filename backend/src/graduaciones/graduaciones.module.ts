import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Graduacion } from './graduacion.entity';

// Módulo esqueleto: por ahora solo registra la entidad para que las
// relaciones de Alumno resuelvan. El CRUD de Graduaciones se implementa
// en el siguiente paso del roadmap.
@Module({
  imports: [TypeOrmModule.forFeature([Graduacion])],
})
export class GraduacionesModule {}
