import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pago } from './pago.entity';

// Módulo esqueleto: por ahora solo registra la entidad para que las
// relaciones de Alumno resuelvan. El CRUD de Pagos se implementa en el
// siguiente paso del roadmap.
@Module({
  imports: [TypeOrmModule.forFeature([Pago])],
})
export class PagosModule {}
