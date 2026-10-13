import 'dotenv/config';
import { DataSource } from 'typeorm';
import { Alumno } from './alumnos/alumno.entity';
import { Usuario } from './auth/usuario.entity';
import { Graduacion } from './graduaciones/graduacion.entity';
import { Pago } from './pagos/pago.entity';

// Para Neon, DATABASE_URL_DIRECT es la conexión directa (sin "-pooler"),
// recomendada para migraciones. Si no está, se usa DATABASE_URL.
const dbUrl = process.env.DATABASE_URL_DIRECT ?? process.env.DATABASE_URL;

// DataSource usado para migraciones (al arrancar y por la CLI de TypeORM).
// La app en sí arma su propia conexión en app.module.ts vía ConfigService.
export default new DataSource({
  type: 'postgres',
  url: dbUrl,
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT ?? 5432),
  username: process.env.DB_USERNAME ?? 'postgres',
  password: process.env.DB_PASSWORD ?? 'postgres',
  database: process.env.DB_NAME ?? 'team_acebal',
  entities: [Alumno, Usuario, Graduacion, Pago],
  migrations: ['./dist/migrations/*.js'],
  ssl: dbUrl ? { rejectUnauthorized: true } : false,
  connectTimeoutMS: 15000,
});
