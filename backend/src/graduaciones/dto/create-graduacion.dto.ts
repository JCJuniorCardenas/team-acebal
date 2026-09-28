import { IsDateString, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateGraduacionDto {
  @IsString()
  @MinLength(1)
  grado!: string;

  @IsOptional()
  @IsString()
  stripe?: string;

  @IsDateString()
  fechaGraduacion!: string; // YYYY-MM-DD
}
