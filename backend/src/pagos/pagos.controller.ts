import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { CreatePagoDto } from './dto/create-pago.dto';
import { UpdatePagoDto } from './dto/update-pago.dto';
import { Pago } from './pago.entity';
import { PagosService } from './pagos.service';

@Controller()
export class PagosController {
  constructor(private readonly pagosService: PagosService) {}

  @Post('alumnos/:alumnoId/pagos')
  create(
    @Param('alumnoId', ParseIntPipe) alumnoId: number,
    @Body() createPagoDto: CreatePagoDto,
  ): Promise<Pago> {
    return this.pagosService.create(alumnoId, createPagoDto);
  }

  @Get('alumnos/:alumnoId/pagos')
  findAllByAlumno(
    @Param('alumnoId', ParseIntPipe) alumnoId: number,
  ): Promise<Pago[]> {
    return this.pagosService.findAllByAlumno(alumnoId);
  }

  @Get('pagos/:id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Pago> {
    return this.pagosService.findOne(id);
  }

  @Patch('pagos/:id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePagoDto: UpdatePagoDto,
  ): Promise<Pago> {
    return this.pagosService.update(id, updatePagoDto);
  }

  @Delete('pagos/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.pagosService.remove(id);
  }
}
