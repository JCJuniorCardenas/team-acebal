import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AlumnosService } from '../alumnos/alumnos.service';
import { CreateGraduacionDto } from './dto/create-graduacion.dto';
import { UpdateGraduacionDto } from './dto/update-graduacion.dto';
import { Graduacion } from './graduacion.entity';

@Injectable()
export class GraduacionesService {
  constructor(
    @InjectRepository(Graduacion)
    private readonly graduacionesRepository: Repository<Graduacion>,
    private readonly alumnosService: AlumnosService,
  ) {}

  async create(
    usuarioId: number,
    alumnoId: number,
    createGraduacionDto: CreateGraduacionDto,
  ): Promise<Graduacion> {
    const alumno = await this.alumnosService.findOne(usuarioId, alumnoId);
    const graduacion = this.graduacionesRepository.create({
      ...createGraduacionDto,
      alumno,
    });
    return this.graduacionesRepository.save(graduacion);
  }

  async findAllByAlumno(
    usuarioId: number,
    alumnoId: number,
  ): Promise<Graduacion[]> {
    await this.alumnosService.findOne(usuarioId, alumnoId);
    return this.graduacionesRepository.find({
      where: { alumno: { id: alumnoId } },
      order: { fechaGraduacion: 'DESC' },
    });
  }

  private async findOwnedGraduacion(
    usuarioId: number,
    id: number,
  ): Promise<Graduacion> {
    const graduacion = await this.graduacionesRepository.findOne({
      where: { id, alumno: { usuario: { id: usuarioId } } },
      relations: { alumno: true },
    });
    if (!graduacion) {
      throw new NotFoundException(`No se encontró la graduación ${id}`);
    }
    return graduacion;
  }

  findOne(usuarioId: number, id: number): Promise<Graduacion> {
    return this.findOwnedGraduacion(usuarioId, id);
  }

  async update(
    usuarioId: number,
    id: number,
    updateGraduacionDto: UpdateGraduacionDto,
  ): Promise<Graduacion> {
    const graduacion = await this.findOwnedGraduacion(usuarioId, id);
    Object.assign(graduacion, updateGraduacionDto);
    return this.graduacionesRepository.save(graduacion);
  }

  async remove(usuarioId: number, id: number): Promise<void> {
    await this.findOwnedGraduacion(usuarioId, id);
    await this.graduacionesRepository.delete(id);
  }
}
