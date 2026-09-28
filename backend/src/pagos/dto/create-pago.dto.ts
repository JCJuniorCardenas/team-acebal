import { IsDateString, IsNumber, IsPositive } from 'class-validator';

export class CreatePagoDto {
  @IsNumber()
  @IsPositive()
  montoPagado!: number;

  @IsDateString()
  fechaPago!: string; // YYYY-MM-DD

  @IsDateString()
  proximaFechaVencimiento!: string; // YYYY-MM-DD
}
