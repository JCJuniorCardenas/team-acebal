import { Transform, TransformFnParams } from 'class-transformer';
import { IsEmail } from 'class-validator';

const trim = ({ value }: TransformFnParams): unknown =>
  typeof value === 'string' ? value.trim() : value;

export class ReenviarVerificacionDto {
  @Transform(trim)
  @IsEmail()
  email!: string;
}
