import 'dotenv/config';
import { DataSource } from 'typeorm';
import { Alumno } from './alumnos/alumno.entity';
import { Usuario } from './auth/usuario.entity';
import { Graduacion } from './graduaciones/graduacion.entity';
import { Pago } from './pagos/pago.entity';

// DataSource usado solo por la CLI de TypeORM (migration:generate/run/revert).
// La app en sí arma su propia conexión en app.module.ts vía ConfigService.
export default new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT ?? 5432),
  username: process.env.DB_USERNAME ?? 'postgres',
  password: process.env.DB_PASSWORD ?? 'postgres',
  database: process.env.DB_NAME ?? 'team_acebal',
  entities: [Alumno, Usuario, Graduacion, Pago],
  migrations: ['./dist/migrations/*.js'],
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false,
});
