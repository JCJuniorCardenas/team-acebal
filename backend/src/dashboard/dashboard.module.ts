import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Alumno } from '../alumnos/alumno.entity';
import { Pago } from '../pagos/pago.entity';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

@Module({
  imports: [TypeOrmModule.forFeature([Alumno, Pago])],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
