import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { Repository } from 'typeorm';
import { EmailService } from '../email/email.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { Usuario } from './usuario.entity';

const VERIFICACION_HORAS_VALIDEZ = 24;

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Usuario) private readonly usuarios: Repository<Usuario>,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly emailService: EmailService,
  ) {}

  async login(dto: LoginDto): Promise<{ access_token: string }> {
    const usuario = await this.usuarios
      .createQueryBuilder('usuario')
      .addSelect('usuario.password')
      .where('usuario.email = :email', { email: dto.email.toLowerCase() })
      .getOne();

    if (!usuario || !(await bcrypt.compare(dto.password, usuario.password))) {
      throw new UnauthorizedException('Email o contraseña incorrectos');
    }

    if (!usuario.emailVerificado) {
      throw new UnauthorizedException(
        'Todavía no confirmaste tu email. Revisá tu bandeja de entrada.',
      );
    }

    return {
      access_token: await this.jwt.signAsync({
        sub: usuario.id,
        email: usuario.email,
      }),
    };
  }

  private async enviarEmailVerificacion(usuario: Usuario): Promise<void> {
    const verificationToken = randomBytes(32).toString('hex');
    usuario.verificationToken = verificationToken;
    usuario.verificationTokenExpira = new Date(
      Date.now() + VERIFICACION_HORAS_VALIDEZ * 60 * 60 * 1000,
    );
    await this.usuarios.save(usuario);

    const backendUrl = this.config.get<string>('BACKEND_URL', 'http://localhost:3000');
    const verificationUrl = `${backendUrl}/auth/verificar/${verificationToken}`;
    await this.emailService.enviarVerificacion(usuario.email, verificationUrl);
  }

  async registrar(dto: RegisterDto): Promise<{ message: string }> {
    const normalizedEmail = dto.email.toLowerCase();
    const existente = await this.usuarios.findOneBy({ email: normalizedEmail });
    if (existente) {
      throw new ConflictException('Ya existe una cuenta con ese email');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const usuario = this.usuarios.create({
      nombre: dto.nombre,
      email: normalizedEmail,
      password: passwordHash,
      emailVerificado: false,
    });
    await this.usuarios.save(usuario);
    await this.enviarEmailVerificacion(usuario);

    return {
      message: 'Cuenta creada. Revisá tu email para confirmarla antes de ingresar.',
    };
  }

  async reenviarVerificacion(email: string): Promise<{ message: string }> {
    const mensaje =
      'Si el email corresponde a una cuenta pendiente de confirmar, te reenviamos el link de verificación.';
    const usuario = await this.usuarios.findOneBy({
      email: email.toLowerCase(),
    });
    if (usuario && !usuario.emailVerificado) {
      await this.enviarEmailVerificacion(usuario);
    }
    return { message: mensaje };
  }

  async verificarEmail(token: string): Promise<void> {
    const usuario = await this.usuarios
      .createQueryBuilder('usuario')
      .addSelect(['usuario.verificationToken', 'usuario.verificationTokenExpira'])
      .where('usuario.verificationToken = :token', { token })
      .getOne();

    if (
      !usuario ||
      !usuario.verificationTokenExpira ||
      usuario.verificationTokenExpira.getTime() < Date.now()
    ) {
      throw new BadRequestException('El link de verificación es inválido o expiró');
    }

    // El token no se invalida acá: algunos clientes de email (ej. Gmail)
    // escanean el link automáticamente por seguridad antes de que la persona
    // haga clic, lo que "gastaría" un token de un solo uso y rompería la
    // verificación real. Como esta operación es idempotente (solo pone
    // emailVerificado en true), no hay riesgo en dejar el link reutilizable
    // hasta que expire.
    usuario.emailVerificado = true;
    await this.usuarios.save(usuario);
  }

  async createAdmin(email: string, password: string): Promise<Usuario> {
    const normalizedEmail = email.toLowerCase();
    let usuario = await this.usuarios.findOneBy({ email: normalizedEmail });
    const passwordHash = await bcrypt.hash(password, 12);
    if (usuario) {
      usuario.password = passwordHash;
    } else {
      usuario = this.usuarios.create({
        email: normalizedEmail,
        password: passwordHash,
      });
    }
    usuario.emailVerificado = true;
    return this.usuarios.save(usuario);
  }
}
