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
export class Graduacion {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  grado!: string;

  @Column({ nullable: true })
  stripe?: string;

  @Column({ type: 'date' })
  fechaGraduacion!: Date;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @ManyToOne(() => Alumno, (alumno) => alumno.graduaciones)
  alumno!: Alumno;
}
