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

  create(createAlumnoDto: CreateAlumnoDto): Promise<Alumno> {
    const alumno = this.alumnosRepository.create(createAlumnoDto);
    return this.alumnosRepository.save(alumno);
  }

  findAll(): Promise<Alumno[]> {
    return this.alumnosRepository.find({ order: { nombre: 'ASC' } });
  }

  async findOne(id: number): Promise<Alumno> {
    const alumno = await this.alumnosRepository.findOne({
      where: { id },
      relations: { pagos: true, graduaciones: true },
    });
    if (!alumno) {
      throw new NotFoundException(`No se encontró el alumno ${id}`);
    }
    return alumno;
  }

  async update(id: number, updateAlumnoDto: UpdateAlumnoDto): Promise<Alumno> {
    const alumno = await this.findOne(id);
    Object.assign(alumno, updateAlumnoDto);
    return this.alumnosRepository.save(alumno);
  }

  async remove(id: number): Promise<void> {
    const result = await this.alumnosRepository.delete(id);
    if (!result.affected) {
      throw new NotFoundException(`No se encontró el alumno ${id}`);
    }
  }
}
