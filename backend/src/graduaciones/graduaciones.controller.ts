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
import { CreateGraduacionDto } from './dto/create-graduacion.dto';
import { UpdateGraduacionDto } from './dto/update-graduacion.dto';
import { Graduacion } from './graduacion.entity';
import { GraduacionesService } from './graduaciones.service';

@Controller()
export class GraduacionesController {
  constructor(private readonly graduacionesService: GraduacionesService) {}

  @Post('alumnos/:alumnoId/graduaciones')
  create(
    @CurrentUser() usuario: CurrentUserPayload,
    @Param('alumnoId', ParseIntPipe) alumnoId: number,
    @Body() createGraduacionDto: CreateGraduacionDto,
  ): Promise<Graduacion> {
    return this.graduacionesService.create(
      usuario.sub,
      alumnoId,
      createGraduacionDto,
    );
  }

  @Get('alumnos/:alumnoId/graduaciones')
  findAllByAlumno(
    @CurrentUser() usuario: CurrentUserPayload,
    @Param('alumnoId', ParseIntPipe) alumnoId: number,
  ): Promise<Graduacion[]> {
    return this.graduacionesService.findAllByAlumno(usuario.sub, alumnoId);
  }

  @Get('graduaciones/:id')
  findOne(
    @CurrentUser() usuario: CurrentUserPayload,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Graduacion> {
    return this.graduacionesService.findOne(usuario.sub, id);
  }

  @Patch('graduaciones/:id')
  update(
    @CurrentUser() usuario: CurrentUserPayload,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateGraduacionDto: UpdateGraduacionDto,
  ): Promise<Graduacion> {
    return this.graduacionesService.update(usuario.sub, id, updateGraduacionDto);
  }

  @Delete('graduaciones/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @CurrentUser() usuario: CurrentUserPayload,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<void> {
    return this.graduacionesService.remove(usuario.sub, id);
  }
}
