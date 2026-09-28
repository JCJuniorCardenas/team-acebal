import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AlumnosService } from '../alumnos/alumnos.service';
import { CreatePagoDto } from './dto/create-pago.dto';
import { UpdatePagoDto } from './dto/update-pago.dto';
import { Pago } from './pago.entity';

@Injectable()
export class PagosService {
  constructor(
    @InjectRepository(Pago)
    private readonly pagosRepository: Repository<Pago>,
    private readonly alumnosService: AlumnosService,
  ) {}

  private validarFechas(
    fechaPago: string,
    proximaFechaVencimiento: string,
  ): void {
    if (proximaFechaVencimiento < fechaPago) {
      throw new BadRequestException(
        'La próxima fecha de vencimiento no puede ser anterior a la fecha de pago',
      );
    }
  }

  async create(alumnoId: number, createPagoDto: CreatePagoDto): Promise<Pago> {
    const alumno = await this.alumnosService.findOne(alumnoId);
    this.validarFechas(
      createPagoDto.fechaPago,
      createPagoDto.proximaFechaVencimiento,
    );
    const pago = this.pagosRepository.create({ ...createPagoDto, alumno });
    return this.pagosRepository.save(pago);
  }

  async findAllByAlumno(alumnoId: number): Promise<Pago[]> {
    await this.alumnosService.findOne(alumnoId);
    return this.pagosRepository.find({
      where: { alumno: { id: alumnoId } },
      order: { fechaPago: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Pago> {
    const pago = await this.pagosRepository.findOne({
      where: { id },
      relations: { alumno: true },
    });
    if (!pago) {
      throw new NotFoundException(`No se encontró el pago ${id}`);
    }
    return pago;
  }

  async update(id: number, updatePagoDto: UpdatePagoDto): Promise<Pago> {
    const pago = await this.findOne(id);
    const fechaPago =
      updatePagoDto.fechaPago ?? this.toDateString(pago.fechaPago);
    const proximaFechaVencimiento =
      updatePagoDto.proximaFechaVencimiento ??
      this.toDateString(pago.proximaFechaVencimiento);
    this.validarFechas(fechaPago, proximaFechaVencimiento);
    Object.assign(pago, updatePagoDto);
    return this.pagosRepository.save(pago);
  }

  async remove(id: number): Promise<void> {
    const result = await this.pagosRepository.delete(id);
    if (!result.affected) {
      throw new NotFoundException(`No se encontró el pago ${id}`);
    }
  }

  private toDateString(date: Date): string {
    return date instanceof Date ? date.toISOString().slice(0, 10) : date;
  }
}
