import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AlumnosModule } from '../alumnos/alumnos.module';
import { Graduacion } from './graduacion.entity';
import { GraduacionesController } from './graduaciones.controller';
import { GraduacionesService } from './graduaciones.service';

@Module({
  imports: [TypeOrmModule.forFeature([Graduacion]), AlumnosModule],
  controllers: [GraduacionesController],
  providers: [GraduacionesService],
})
export class GraduacionesModule {}
