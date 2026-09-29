import { NotFoundException } from '@nestjs/common';
import { GraduacionesService } from './graduaciones.service';

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
    findOne: jest.fn((_usuarioId: number, id: number) => {
      if (!alumnoExiste) {
        return Promise.reject(
          new NotFoundException(`No se encontró el alumno ${id}`),
        );
      }
      return Promise.resolve(alumno);
    }),
  };
  const service = new GraduacionesService(
    repository as never,
    alumnosService as never,
  );
  return { service, repository, alumnosService };
}

describe('GraduacionesService', () => {
  describe('create', () => {
    it('crea una graduación cuando el alumno existe', async () => {
      const { service, repository } = buildService();
      await service.create(1, 1, {
        grado: 'Cinturón amarillo',
        fechaGraduacion: '2026-03-15',
      });
      expect(repository.save).toHaveBeenCalled();
    });

    it('rechaza si el alumno no existe', async () => {
      const { service } = buildService(false);
      await expect(
        service.create(1, 999, {
          grado: 'Cinturón amarillo',
          fechaGraduacion: '2026-03-15',
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAllByAlumno', () => {
    it('lanza 404 si el alumno no existe', async () => {
      const { service } = buildService(false);
      await expect(service.findAllByAlumno(1, 999)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('consulta ordenado por fecha descendente', async () => {
      const { service, repository } = buildService();
      repository.find.mockResolvedValue([]);
      await service.findAllByAlumno(1, 1);
      expect(repository.find).toHaveBeenCalledWith({
        where: { alumno: { id: 1 } },
        order: { fechaGraduacion: 'DESC' },
      });
    });
  });

  describe('findOne', () => {
    it('lanza 404 si no existe', async () => {
      const { service, repository } = buildService();
      repository.findOne.mockResolvedValue(null);
      await expect(service.findOne(1, 999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('lanza 404 si no afectó ninguna fila', async () => {
      const { service, repository } = buildService();
      repository.findOne.mockResolvedValue(null);
      await expect(service.remove(1, 999)).rejects.toThrow(NotFoundException);
    });
  });
});
