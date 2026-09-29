import { NotFoundException } from '@nestjs/common';
import { AlumnosService } from './alumnos.service';

function buildService() {
  const repository = {
    create: jest.fn((dto: Record<string, unknown>) => dto),
    save: jest.fn((entity: Record<string, unknown>) =>
      Promise.resolve({ id: 1, ...entity }),
    ),
    find: jest.fn(),
    findOne: jest.fn(),
    delete: jest.fn(),
  };
  const service = new AlumnosService(repository as never);
  return { service, repository };
}

describe('AlumnosService', () => {
  describe('create', () => {
    it('crea y guarda un alumno asociado al usuario dueño', async () => {
      const { service, repository } = buildService();
      const alumno = await service.create(1, { nombre: 'Juan' });
      expect(repository.create).toHaveBeenCalledWith({
        nombre: 'Juan',
        usuario: { id: 1 },
      });
      expect(repository.save).toHaveBeenCalled();
      expect(alumno).toMatchObject({ nombre: 'Juan' });
    });
  });

  describe('findAll', () => {
    it('lista ordenado por nombre, filtrado por usuario', async () => {
      const { service, repository } = buildService();
      repository.find.mockResolvedValue([]);
      await service.findAll(1);
      expect(repository.find).toHaveBeenCalledWith({
        where: { usuario: { id: 1 } },
        order: { nombre: 'ASC' },
      });
    });
  });

  describe('findOne', () => {
    it('devuelve el alumno con sus pagos y graduaciones', async () => {
      const { service, repository } = buildService();
      const alumno = { id: 1, nombre: 'Juan', pagos: [], graduaciones: [] };
      repository.findOne.mockResolvedValue(alumno);
      await expect(service.findOne(1, 1)).resolves.toEqual(alumno);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: 1, usuario: { id: 1 } },
        relations: { pagos: true, graduaciones: true },
      });
    });

    it('lanza 404 si no existe o no le pertenece al usuario', async () => {
      const { service, repository } = buildService();
      repository.findOne.mockResolvedValue(null);
      await expect(service.findOne(1, 999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('mezcla los cambios sobre el alumno existente', async () => {
      const { service, repository } = buildService();
      repository.findOne.mockResolvedValue({
        id: 1,
        nombre: 'Juan',
        apellido: 'Perez',
      });
      const actualizado = await service.update(1, 1, { apellido: 'Gomez' });
      expect(actualizado.apellido).toBe('Gomez');
      expect(actualizado.nombre).toBe('Juan');
    });
  });

  describe('remove', () => {
    it('elimina cuando existe', async () => {
      const { service, repository } = buildService();
      repository.delete.mockResolvedValue({ affected: 1 });
      await expect(service.remove(1, 1)).resolves.toBeUndefined();
    });

    it('lanza 404 si no afectó ninguna fila', async () => {
      const { service, repository } = buildService();
      repository.delete.mockResolvedValue({ affected: 0 });
      await expect(service.remove(1, 999)).rejects.toThrow(NotFoundException);
    });
  });
});
