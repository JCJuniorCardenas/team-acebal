import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AlumnosModule } from '../alumnos/alumnos.module';
import { Pago } from './pago.entity';
import { PagosController } from './pagos.controller';
import { PagosService } from './pagos.service';

@Module({
  imports: [TypeOrmModule.forFeature([Pago]), AlumnosModule],
  controllers: [PagosController],
  providers: [PagosService],
})
export class PagosModule {}
