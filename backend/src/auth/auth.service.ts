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

  async registrar(dto: RegisterDto): Promise<{ message: string }> {
    const normalizedEmail = dto.email.toLowerCase();
    const existente = await this.usuarios.findOneBy({ email: normalizedEmail });
    if (existente) {
      throw new ConflictException('Ya existe una cuenta con ese email');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const verificationToken = randomBytes(32).toString('hex');
    const verificationTokenExpira = new Date(
      Date.now() + VERIFICACION_HORAS_VALIDEZ * 60 * 60 * 1000,
    );

    const usuario = this.usuarios.create({
      nombre: dto.nombre,
      email: normalizedEmail,
      password: passwordHash,
      emailVerificado: false,
      verificationToken,
      verificationTokenExpira,
    });
    await this.usuarios.save(usuario);

    const backendUrl = this.config.get<string>('BACKEND_URL', 'http://localhost:3000');
    const verificationUrl = `${backendUrl}/auth/verificar/${verificationToken}`;
    await this.emailService.enviarVerificacion(normalizedEmail, verificationUrl);

    return {
      message: 'Cuenta creada. Revisá tu email para confirmarla antes de ingresar.',
    };
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

    usuario.emailVerificado = true;
    usuario.verificationToken = null;
    usuario.verificationTokenExpira = null;
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
