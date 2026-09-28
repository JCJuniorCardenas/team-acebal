import { BadRequestException, NotFoundException } from '@nestjs/common';
import { PagosService } from './pagos.service';

function buildService(alumnoExiste = true) {
  const repository = {
    create: jest.fn((dto: Record<string, unknown>) => dto),
    save: jest.fn((entity: Record<string, unknown>) =>
      Promise.resolve({ id: 1, ...entity }),
    ),
    find: jest.fn(),
    findOne: jest.fn(),
    delete: jest.fn(),
  };
  const alumno = { id: 1, nombre: 'Juan' };
  const alumnosService = {
    findOne: jest.fn((id: number) => {
      if (!alumnoExiste) {
        return Promise.reject(
          new NotFoundException(`No se encontró el alumno ${id}`),
        );
      }
      return Promise.resolve(alumno);
    }),
  };
  const service = new PagosService(
    repository as never,
    alumnosService as never,
  );
  return { service, repository, alumnosService };
}

describe('PagosService', () => {
  describe('create', () => {
    it('crea un pago cuando el alumno existe y las fechas son válidas', async () => {
      const { service, repository } = buildService();
      await service.create(1, {
        montoPagado: 15000,
        fechaPago: '2026-01-01',
        proximaFechaVencimiento: '2026-02-01',
      });
      expect(repository.save).toHaveBeenCalled();
    });

    it('rechaza si el alumno no existe', async () => {
      const { service } = buildService(false);
      await expect(
        service.create(999, {
          montoPagado: 15000,
          fechaPago: '2026-01-01',
          proximaFechaVencimiento: '2026-02-01',
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('rechaza si el vencimiento es anterior al pago', async () => {
      const { service } = buildService();
      await expect(
        service.create(1, {
          montoPagado: 15000,
          fechaPago: '2026-02-01',
          proximaFechaVencimiento: '2026-01-01',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('acepta que el vencimiento sea el mismo día que el pago', async () => {
      const { service, repository } = buildService();
      await service.create(1, {
        montoPagado: 15000,
        fechaPago: '2026-01-01',
        proximaFechaVencimiento: '2026-01-01',
      });
      expect(repository.save).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('valida contra la fecha ya guardada cuando el PATCH solo cambia una fecha', async () => {
      const { service, repository } = buildService();
      repository.findOne.mockResolvedValue({
        id: 1,
        fechaPago: new Date('2026-01-01'),
        proximaFechaVencimiento: new Date('2026-02-01'),
      });
      await expect(
        service.update(1, { proximaFechaVencimiento: '2025-12-01' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('permite actualizar un campo que no rompe la validación cruzada', async () => {
      const { service, repository } = buildService();
      repository.findOne.mockResolvedValue({
        id: 1,
        fechaPago: new Date('2026-01-01'),
        proximaFechaVencimiento: new Date('2026-02-01'),
      });
      const actualizado = await service.update(1, { montoPagado: 20000 });
      expect(actualizado.montoPagado).toBe(20000);
    });
  });

  describe('findAllByAlumno', () => {
    it('lanza 404 si el alumno no existe', async () => {
      const { service } = buildService(false);
      await expect(service.findAllByAlumno(999)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('lanza 404 si no existe el pago', async () => {
      const { service, repository } = buildService();
      repository.delete.mockResolvedValue({ affected: 0 });
      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });
});
