import { IsDateString, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateAlumnoDto {
  @IsString()
  @MinLength(2)
  nombre!: string;

  @IsOptional()
  @IsString()
  apellido?: string;

  @IsOptional()
  @IsString()
  telefono?: string;

  @IsOptional()
  @IsDateString()
  fechaNacimiento?: string; // YYYY-MM-DD
}
