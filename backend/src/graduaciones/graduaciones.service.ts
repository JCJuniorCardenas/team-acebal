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
    alumnoId: number,
    createGraduacionDto: CreateGraduacionDto,
  ): Promise<Graduacion> {
    const alumno = await this.alumnosService.findOne(alumnoId);
    const graduacion = this.graduacionesRepository.create({
      ...createGraduacionDto,
      alumno,
    });
    return this.graduacionesRepository.save(graduacion);
  }

  async findAllByAlumno(alumnoId: number): Promise<Graduacion[]> {
    await this.alumnosService.findOne(alumnoId);
    return this.graduacionesRepository.find({
      where: { alumno: { id: alumnoId } },
      order: { fechaGraduacion: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Graduacion> {
    const graduacion = await this.graduacionesRepository.findOne({
      where: { id },
      relations: { alumno: true },
    });
    if (!graduacion) {
      throw new NotFoundException(`No se encontró la graduación ${id}`);
    }
    return graduacion;
  }

  async update(
    id: number,
    updateGraduacionDto: UpdateGraduacionDto,
  ): Promise<Graduacion> {
    const graduacion = await this.findOne(id);
    Object.assign(graduacion, updateGraduacionDto);
    return this.graduacionesRepository.save(graduacion);
  }

  async remove(id: number): Promise<void> {
    const result = await this.graduacionesRepository.delete(id);
    if (!result.affected) {
      throw new NotFoundException(`No se encontró la graduación ${id}`);
    }
  }
}
