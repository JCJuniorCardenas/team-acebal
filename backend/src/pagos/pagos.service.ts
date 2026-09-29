import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AlumnosService } from '../alumnos/alumnos.service';
import { toDateString } from '../common/date.util';
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

  async create(
    usuarioId: number,
    alumnoId: number,
    createPagoDto: CreatePagoDto,
  ): Promise<Pago> {
    const alumno = await this.alumnosService.findOne(usuarioId, alumnoId);
    this.validarFechas(
      createPagoDto.fechaPago,
      createPagoDto.proximaFechaVencimiento,
    );
    const pago = this.pagosRepository.create({ ...createPagoDto, alumno });
    return this.pagosRepository.save(pago);
  }

  async findAllByAlumno(usuarioId: number, alumnoId: number): Promise<Pago[]> {
    await this.alumnosService.findOne(usuarioId, alumnoId);
    return this.pagosRepository.find({
      where: { alumno: { id: alumnoId } },
      order: { fechaPago: 'DESC' },
    });
  }

  private async findOwnedPago(usuarioId: number, id: number): Promise<Pago> {
    const pago = await this.pagosRepository.findOne({
      where: { id, alumno: { usuario: { id: usuarioId } } },
      relations: { alumno: true },
    });
    if (!pago) {
      throw new NotFoundException(`No se encontró el pago ${id}`);
    }
    return pago;
  }

  findOne(usuarioId: number, id: number): Promise<Pago> {
    return this.findOwnedPago(usuarioId, id);
  }

  async update(
    usuarioId: number,
    id: number,
    updatePagoDto: UpdatePagoDto,
  ): Promise<Pago> {
    const pago = await this.findOwnedPago(usuarioId, id);
    const fechaPago = updatePagoDto.fechaPago ?? toDateString(pago.fechaPago);
    const proximaFechaVencimiento =
      updatePagoDto.proximaFechaVencimiento ??
      toDateString(pago.proximaFechaVencimiento);
    this.validarFechas(fechaPago, proximaFechaVencimiento);
    Object.assign(pago, updatePagoDto);
    return this.pagosRepository.save(pago);
  }

  async remove(usuarioId: number, id: number): Promise<void> {
    await this.findOwnedPago(usuarioId, id);
    await this.pagosRepository.delete(id);
  }
}
