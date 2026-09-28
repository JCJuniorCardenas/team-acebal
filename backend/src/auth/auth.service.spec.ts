import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';

// @nestjs/jwt se publica como ESM puro; en el entorno de test (ts-jest en
// CommonJS) no se puede cargar directamente. No necesitamos la clase real
// acá (usamos un mock de JwtService de todos modos), así que se reemplaza
// por un stub vacío para evitar el error de carga.
jest.mock('@nestjs/jwt', () => ({ JwtService: class {} }));
jest.mock('bcrypt');

function buildQueryBuilder(usuario: unknown) {
  const qb = {
    addSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    getOne: jest.fn().mockResolvedValue(usuario),
  };
  return qb;
}

function buildService(usuarioEncontrado: unknown = null) {
  const repository = {
    createQueryBuilder: jest.fn(() => buildQueryBuilder(usuarioEncontrado)),
    findOneBy: jest.fn(),
    create: jest.fn((dto: Record<string, unknown>) => dto),
    save: jest.fn((entity: Record<string, unknown>) =>
      Promise.resolve({ id: 1, ...entity }),
    ),
  };
  const jwt = { signAsync: jest.fn().mockResolvedValue('token-falso') };
  const service = new AuthService(repository as never, jwt as never);
  return { service, repository, jwt };
}

describe('AuthService', () => {
  afterEach(() => jest.clearAllMocks());

  describe('login', () => {
    it('rechaza si el email no existe', async () => {
      const { service } = buildService(null);
      await expect(
        service.login({ email: 'nadie@test.com', password: 'x' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('rechaza si la contraseña no coincide', async () => {
      const { service } = buildService({
        id: 1,
        email: 'admin@test.com',
        password: 'hash',
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      await expect(
        service.login({ email: 'admin@test.com', password: 'mal' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('devuelve un access_token con credenciales correctas', async () => {
      const { service, jwt } = buildService({
        id: 1,
        email: 'admin@test.com',
        password: 'hash',
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      const result = await service.login({
        email: 'admin@test.com',
        password: 'bien',
      });
      expect(result).toEqual({ access_token: 'token-falso' });
      expect(jwt.signAsync).toHaveBeenCalledWith({
        sub: 1,
        email: 'admin@test.com',
      });
    });
  });

  describe('createAdmin', () => {
    it('crea el usuario si no existía', async () => {
      const { service, repository } = buildService();
      repository.findOneBy.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hash-nuevo');
      await service.createAdmin('Admin@Test.com', 'clave');
      expect(repository.create).toHaveBeenCalledWith({
        email: 'admin@test.com',
        password: 'hash-nuevo',
      });
    });

    it('actualiza la contraseña si el usuario ya existía (idempotente)', async () => {
      const { service, repository } = buildService();
      const existente = {
        id: 1,
        email: 'admin@test.com',
        password: 'hash-viejo',
      };
      repository.findOneBy.mockResolvedValue(existente);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hash-nuevo');
      await service.createAdmin('admin@test.com', 'clave-nueva');
      expect(repository.create).not.toHaveBeenCalled();
      expect(existente.password).toBe('hash-nuevo');
      expect(repository.save).toHaveBeenCalledWith(existente);
    });
  });
});
