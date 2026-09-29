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
import { Alumno } from './alumno.entity';
import { AlumnosService } from './alumnos.service';
import { CreateAlumnoDto } from './dto/create-alumno.dto';
import { UpdateAlumnoDto } from './dto/update-alumno.dto';

@Controller('alumnos')
export class AlumnosController {
  constructor(private readonly alumnosService: AlumnosService) {}

  @Post()
  create(
    @CurrentUser() usuario: CurrentUserPayload,
    @Body() createAlumnoDto: CreateAlumnoDto,
  ): Promise<Alumno> {
    return this.alumnosService.create(usuario.sub, createAlumnoDto);
  }

  @Get()
  findAll(@CurrentUser() usuario: CurrentUserPayload): Promise<Alumno[]> {
    return this.alumnosService.findAll(usuario.sub);
  }

  @Get(':id')
  findOne(
    @CurrentUser() usuario: CurrentUserPayload,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Alumno> {
    return this.alumnosService.findOne(usuario.sub, id);
  }

  @Patch(':id')
  update(
    @CurrentUser() usuario: CurrentUserPayload,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAlumnoDto: UpdateAlumnoDto,
  ): Promise<Alumno> {
    return this.alumnosService.update(usuario.sub, id, updateAlumnoDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @CurrentUser() usuario: CurrentUserPayload,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<void> {
    return this.alumnosService.remove(usuario.sub, id);
  }
}
