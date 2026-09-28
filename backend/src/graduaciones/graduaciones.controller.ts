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
import { CreateGraduacionDto } from './dto/create-graduacion.dto';
import { UpdateGraduacionDto } from './dto/update-graduacion.dto';
import { Graduacion } from './graduacion.entity';
import { GraduacionesService } from './graduaciones.service';

@Controller()
export class GraduacionesController {
  constructor(private readonly graduacionesService: GraduacionesService) {}

  @Post('alumnos/:alumnoId/graduaciones')
  create(
    @Param('alumnoId', ParseIntPipe) alumnoId: number,
    @Body() createGraduacionDto: CreateGraduacionDto,
  ): Promise<Graduacion> {
    return this.graduacionesService.create(alumnoId, createGraduacionDto);
  }

  @Get('alumnos/:alumnoId/graduaciones')
  findAllByAlumno(
    @Param('alumnoId', ParseIntPipe) alumnoId: number,
  ): Promise<Graduacion[]> {
    return this.graduacionesService.findAllByAlumno(alumnoId);
  }

  @Get('graduaciones/:id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Graduacion> {
    return this.graduacionesService.findOne(id);
  }

  @Patch('graduaciones/:id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateGraduacionDto: UpdateGraduacionDto,
  ): Promise<Graduacion> {
    return this.graduacionesService.update(id, updateGraduacionDto);
  }

  @Delete('graduaciones/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.graduacionesService.remove(id);
  }
}
