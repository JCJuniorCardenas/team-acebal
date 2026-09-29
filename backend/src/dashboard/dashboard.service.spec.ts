import { addDays, argentinaToday } from '../common/date.util';
import { DashboardService } from './dashboard.service';

function buildService({ alumnos = [], pagos = [] } = {}) {
  const alumnosRepository = {
    count: jest.fn().mockResolvedValue(alumnos.length),
    find: jest.fn().mockResolvedValue(alumnos),
  };
  const pagosRepository = {
    find: jest.fn().mockResolvedValue(pagos),
  };
  const service = new DashboardService(
    alumnosRepository as never,
    pagosRepository as never,
  );
  return { service, alumnosRepository, pagosRepository };
}

describe('DashboardService', () => {
  const hoy = argentinaToday();

  it('clasifica como vencido al alumno cuyo último pago ya venció', async () => {
    const alumno = { id: 1, nombre: 'Juan', apellido: 'Perez' };
    const { service } = buildService({
      alumnos: [alumno],
      pagos: [
        {
          id: 1,
          montoPagado: 10000,
          fechaPago: addDays(hoy, -40),
          proximaFechaVencimiento: addDays(hoy, -10),
          alumno,
        },
      ],
    });

    const resumen = await service.resumen(1);

    expect(resumen.vencidos).toHaveLength(1);
    expect(resumen.vencidos[0]).toMatchObject({ alumnoId: 1, diasVencido: 10 });
    expect(resumen.proximosAVencer).toHaveLength(0);
    expect(resumen.sinPagos).toHaveLength(0);
    expect(resumen.totalPagosVencidos).toBe(1);
  });

  it('clasifica como próximo a vencer si vence dentro de los próximos 7 días', async () => {
    const alumno = { id: 2, nombre: 'Ana', apellido: 'Diaz' };
    const { service } = buildService({
      alumnos: [alumno],
      pagos: [
        {
          id: 2,
          montoPagado: 10000,
          fechaPago: addDays(hoy, -25),
          proximaFechaVencimiento: addDays(hoy, 5),
          alumno,
        },
      ],
    });

    const resumen = await service.resumen(1);

    expect(resumen.vencidos).toHaveLength(0);
    expect(resumen.proximosAVencer).toHaveLength(1);
    expect(resumen.proximosAVencer[0]).toMatchObject({
      alumnoId: 2,
      diasParaVencer: 5,
    });
  });

  it('no clasifica como próximo a vencer si falta más de 7 días', async () => {
    const alumno = { id: 3, nombre: 'Lucas', apellido: 'Gomez' };
    const { service } = buildService({
      alumnos: [alumno],
      pagos: [
        {
          id: 3,
          montoPagado: 10000,
          fechaPago: hoy,
          proximaFechaVencimiento: addDays(hoy, 30),
          alumno,
        },
      ],
    });

    const resumen = await service.resumen(1);

    expect(resumen.vencidos).toHaveLength(0);
    expect(resumen.proximosAVencer).toHaveLength(0);
  });

  it('lista en "sinPagos" a los alumnos que nunca registraron un pago', async () => {
    const alumno = { id: 4, nombre: 'Marina', apellido: 'Ruiz' };
    const { service } = buildService({ alumnos: [alumno], pagos: [] });

    const resumen = await service.resumen(1);

    expect(resumen.sinPagos).toEqual([
      { alumnoId: 4, nombre: 'Marina', apellido: 'Ruiz' },
    ]);
  });

  it('usa el pago más reciente cuando un alumno tiene varios', async () => {
    const alumno = { id: 5, nombre: 'Pedro', apellido: 'Lopez' };
    const { service } = buildService({
      alumnos: [alumno],
      pagos: [
        // El repositorio ya los devuelve ordenados por fechaPago DESC
        {
          id: 11,
          montoPagado: 10000,
          fechaPago: addDays(hoy, -2),
          proximaFechaVencimiento: addDays(hoy, 28),
          alumno,
        },
        {
          id: 10,
          montoPagado: 10000,
          fechaPago: addDays(hoy, -32),
          proximaFechaVencimiento: addDays(hoy, -2),
          alumno,
        },
      ],
    });

    const resumen = await service.resumen(1);

    // El pago viejo ya estaría vencido, pero el vigente es el más reciente y no lo está.
    expect(resumen.vencidos).toHaveLength(0);
    expect(resumen.proximosAVencer).toHaveLength(0);
  });

  it('suma al mes solo los pagos hechos en el mes actual', async () => {
    const alumno = { id: 6, nombre: 'Carla', apellido: 'Nuñez' };
    const inicioDeMes = `${hoy.slice(0, 7)}-01`;
    const { service } = buildService({
      alumnos: [alumno],
      pagos: [
        {
          id: 20,
          montoPagado: 5000,
          fechaPago: hoy,
          proximaFechaVencimiento: addDays(hoy, 30),
          alumno,
        },
        {
          id: 21,
          montoPagado: 9999,
          fechaPago: addDays(inicioDeMes, -1),
          proximaFechaVencimiento: addDays(hoy, -60),
          alumno,
        },
      ],
    });

    const resumen = await service.resumen(1);

    expect(resumen.recaudadoMes).toBe(5000);
  });
});
