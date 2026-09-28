import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { LoginDto } from './dto/login.dto';
import { Usuario } from './usuario.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Usuario) private readonly usuarios: Repository<Usuario>,
    private readonly jwt: JwtService,
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

    return {
      access_token: await this.jwt.signAsync({
        sub: usuario.id,
        email: usuario.email,
      }),
    };
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
    return this.usuarios.save(usuario);
  }
}
