import { Transform, TransformFnParams } from 'class-transformer';
import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

const trim = ({ value }: TransformFnParams): unknown =>
  typeof value === 'string' ? value.trim() : value;

export class RegisterDto {
  @Transform(trim)
  @IsOptional()
  @IsString()
  nombre?: string;

  @Transform(trim)
  @IsEmail()
  email!: string;

  @Transform(trim)
  @IsString()
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  password!: string;
}
