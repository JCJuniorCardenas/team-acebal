import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Usuario {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ nullable: true })
  nombre?: string;

  @Column({ unique: true })
  email!: string;

  @Column({ select: false })
  password!: string;

  @Column({ default: false })
  emailVerificado!: boolean;

  @Column({ nullable: true, select: false, type: 'varchar' })
  verificationToken?: string | null;

  @Column({ nullable: true, select: false, type: 'timestamp' })
  verificationTokenExpira?: Date | null;

  @CreateDateColumn()
  createdAt!: Date;
}
