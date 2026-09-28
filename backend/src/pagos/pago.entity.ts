import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Alumno } from '../alumnos/alumno.entity';

@Entity()
export class Pago {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  montoPagado!: number;

  @Column({ type: 'date' })
  fechaPago!: Date;

  @Column({ type: 'date' })
  proximaFechaVencimiento!: Date;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @ManyToOne(() => Alumno, (alumno) => alumno.pagos)
  alumno!: Alumno;
}
