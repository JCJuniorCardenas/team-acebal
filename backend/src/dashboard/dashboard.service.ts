import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Alumno } from '../alumnos/alumno.entity';
import {
  addDays,
  argentinaToday,
  diffDays,
  toDateString,
} from '../common/date.util';
import { Pago } from '../pagos/pago.entity';

interface AlumnoResumen {
  alumnoId: number;
  nombre: string;
  apellido?: string;
}

interface VencimientoResumen extends AlumnoResumen {
  fechaVencimiento: string;
  diasVencido: number;
}

interface ProximoVencimientoResumen extends AlumnoResumen {
  fechaVencimiento: string;
  diasParaVencer: number;
}

export interface ResumenDashboard {
  fecha: string;
  totalAlumnos: number;
  totalPagosVencidos: number;
  recaudadoMes: number;
  vencidos: VencimientoResumen[];
  proximosAVencer: ProximoVencimientoResumen[];
  sinPagos: AlumnoResumen[];
}

const DIAS_ALERTA_PROXIMO_VENCIMIENTO = 7;

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Alumno)
    private readonly alumnosRepository: Repository<Alumno>,
    @InjectRepository(Pago) private readonly pagosRepository: Repository<Pago>,
  ) {}

  async resumen(): Promise<ResumenDashboard> {
    const hoy = argentinaToday();
    const limiteProximoVencimiento = addDays(
      hoy,
      DIAS_ALERTA_PROXIMO_VENCIMIENTO,
    );
    const inicioDeMes = `${hoy.slice(0, 7)}-01`;

    const [totalAlumnos, alumnos, pagos] = await Promise.all([
      this.alumnosRepository.count(),
      this.alumnosRepository.find({ order: { nombre: 'ASC' } }),
      this.pagosRepository.find({
        relations: { alumno: true },
        order: { fechaPago: 'DESC' },
      }),
    ]);

    // El pago "vigente" de un alumno es el más reciente (por fecha de pago);
    // su vencimiento es lo que determina si está al día o no.
    const ultimoPagoPorAlumno = new Map<number, Pago>();
    for (const pago of pagos) {
      if (!ultimoPagoPorAlumno.has(pago.alumno.id)) {
        ultimoPagoPorAlumno.set(pago.alumno.id, pago);
      }
    }

    const vencidos: VencimientoResumen[] = [];
    const proximosAVencer: ProximoVencimientoResumen[] = [];

    for (const pago of ultimoPagoPorAlumno.values()) {
      const fechaVencimiento = toDateString(pago.proximaFechaVencimiento);
      const resumenAlumno: AlumnoResumen = {
        alumnoId: pago.alumno.id,
        nombre: pago.alumno.nombre,
        apellido: pago.alumno.apellido,
      };
      if (fechaVencimiento < hoy) {
        vencidos.push({
          ...resumenAlumno,
          fechaVencimiento,
          diasVencido: diffDays(hoy, fechaVencimiento),
        });
      } else if (fechaVencimiento <= limiteProximoVencimiento) {
        proximosAVencer.push({
          ...resumenAlumno,
          fechaVencimiento,
          diasParaVencer: diffDays(fechaVencimiento, hoy),
        });
      }
    }

    vencidos.sort((a, b) => b.diasVencido - a.diasVencido);
    proximosAVencer.sort((a, b) => a.diasParaVencer - b.diasParaVencer);

    const idsConPago = new Set(ultimoPagoPorAlumno.keys());
    const sinPagos: AlumnoResumen[] = alumnos
      .filter((alumno) => !idsConPago.has(alumno.id))
      .map((alumno) => ({
        alumnoId: alumno.id,
        nombre: alumno.nombre,
        apellido: alumno.apellido,
      }));

    const recaudadoMes = pagos
      .filter((pago) => toDateString(pago.fechaPago) >= inicioDeMes)
      .reduce((total, pago) => total + Number(pago.montoPagado), 0);

    return {
      fecha: hoy,
      totalAlumnos,
      totalPagosVencidos: vencidos.length,
      recaudadoMes,
      vencidos,
      proximosAVencer,
      sinPagos,
    };
  }
}
