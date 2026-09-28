import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Pago } from '../pagos/pago.entity';
import { Graduacion } from '../graduaciones/graduacion.entity';

@Entity()
export class Alumno {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  nombre!: string;

  @Column({ nullable: true })
  apellido?: string;

  @Column({ nullable: true })
  telefono?: string;

  @Column({ nullable: true, type: 'date' })
  fechaNacimiento?: Date;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @OneToMany(() => Pago, (pago) => pago.alumno)
  pagos!: Pago[];

  @OneToMany(() => Graduacion, (graduacion) => graduacion.alumno)
  graduaciones!: Graduacion[];
}
