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
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { CurrentUserPayload } from '../common/decorators/current-user.decorator';
import { CreatePagoDto } from './dto/create-pago.dto';
import { UpdatePagoDto } from './dto/update-pago.dto';
import { Pago } from './pago.entity';
import { PagosService } from './pagos.service';

@Controller()
export class PagosController {
  constructor(private readonly pagosService: PagosService) {}

  @Post('alumnos/:alumnoId/pagos')
  create(
    @CurrentUser() usuario: CurrentUserPayload,
    @Param('alumnoId', ParseIntPipe) alumnoId: number,
    @Body() createPagoDto: CreatePagoDto,
  ): Promise<Pago> {
    return this.pagosService.create(usuario.sub, alumnoId, createPagoDto);
  }

  @Get('alumnos/:alumnoId/pagos')
  findAllByAlumno(
    @CurrentUser() usuario: CurrentUserPayload,
    @Param('alumnoId', ParseIntPipe) alumnoId: number,
  ): Promise<Pago[]> {
    return this.pagosService.findAllByAlumno(usuario.sub, alumnoId);
  }

  @Get('pagos/:id')
  findOne(
    @CurrentUser() usuario: CurrentUserPayload,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Pago> {
    return this.pagosService.findOne(usuario.sub, id);
  }

  @Patch('pagos/:id')
  update(
    @CurrentUser() usuario: CurrentUserPayload,
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePagoDto: UpdatePagoDto,
  ): Promise<Pago> {
    return this.pagosService.update(usuario.sub, id, updatePagoDto);
  }

  @Delete('pagos/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @CurrentUser() usuario: CurrentUserPayload,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<void> {
    return this.pagosService.remove(usuario.sub, id);
  }
}
