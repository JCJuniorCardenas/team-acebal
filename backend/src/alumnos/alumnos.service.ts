import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Alumno } from './alumno.entity';
import { CreateAlumnoDto } from './dto/create-alumno.dto';
import { UpdateAlumnoDto } from './dto/update-alumno.dto';

@Injectable()
export class AlumnosService {
  constructor(
    @InjectRepository(Alumno)
    private readonly alumnosRepository: Repository<Alumno>,
  ) {}

  create(usuarioId: number, createAlumnoDto: CreateAlumnoDto): Promise<Alumno> {
    const alumno = this.alumnosRepository.create({
      ...createAlumnoDto,
      usuario: { id: usuarioId },
    });
    return this.alumnosRepository.save(alumno);
  }

  findAll(usuarioId: number): Promise<Alumno[]> {
    return this.alumnosRepository.find({
      where: { usuario: { id: usuarioId } },
      order: { nombre: 'ASC' },
    });
  }

  async findOne(usuarioId: number, id: number): Promise<Alumno> {
    const alumno = await this.alumnosRepository.findOne({
      where: { id, usuario: { id: usuarioId } },
      relations: { pagos: true, graduaciones: true },
    });
    if (!alumno) {
      throw new NotFoundException(`No se encontró el alumno ${id}`);
    }
    return alumno;
  }

  async update(
    usuarioId: number,
    id: number,
    updateAlumnoDto: UpdateAlumnoDto,
  ): Promise<Alumno> {
    const alumno = await this.findOne(usuarioId, id);
    Object.assign(alumno, updateAlumnoDto);
    return this.alumnosRepository.save(alumno);
  }

  async remove(usuarioId: number, id: number): Promise<void> {
    const result = await this.alumnosRepository.delete({
      id,
      usuario: { id: usuarioId },
    });
    if (!result.affected) {
      throw new NotFoundException(`No se encontró el alumno ${id}`);
    }
  }
}
