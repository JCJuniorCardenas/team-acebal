// Respaldo y copia de datos entre bases PostgreSQL sin necesitar pg_dump.
//   node scripts/copiar-datos.js backup    -> lee OLD_DATABASE_URL y guarda backups/respaldo.json
//   node scripts/copiar-datos.js restore   -> carga ese JSON en DATABASE_URL_DIRECT (o DATABASE_URL)
// Las URLs se leen del entorno / .env; nunca se imprimen.
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Client, types } = require('pg');

types.setTypeParser(1082, (v) => v); // columnas "date" como texto, sin corrimiento de zona horaria

const TABLAS = ['usuario', 'alumno', 'pago', 'graduacion']; // orden por dependencias
const ARCHIVO = path.join(__dirname, '..', 'backups', 'respaldo.json');

async function conectar(url) {
  if (!url) throw new Error('Falta la variable de entorno con la URL de la base.');
  const c = new Client({ connectionString: url, ssl: { rejectUnauthorized: false } });
  await c.connect();
  return c;
}

async function backup() {
  const c = await conectar(process.env.OLD_DATABASE_URL);
  const datos = {};
  for (const t of TABLAS) {
    datos[t] = (await c.query(`SELECT * FROM "${t}" ORDER BY id`)).rows;
    console.log(`${t}: ${datos[t].length} filas`);
  }
  await c.end();
  fs.mkdirSync(path.dirname(ARCHIVO), { recursive: true });
  fs.writeFileSync(ARCHIVO, JSON.stringify(datos));
  console.log('Respaldo guardado en backups/respaldo.json');
}

async function restore() {
  const datos = JSON.parse(fs.readFileSync(ARCHIVO, 'utf8'));
  const c = await conectar(process.env.DATABASE_URL_DIRECT ?? process.env.DATABASE_URL);
  await c.query('BEGIN');
  try {
    for (const t of TABLAS) {
      const filas = datos[t] ?? [];
      for (const f of filas) {
        const cols = Object.keys(f);
        await c.query(
          `INSERT INTO "${t}" (${cols.map((x) => `"${x}"`).join(',')}) VALUES (${cols.map((_, i) => `$${i + 1}`).join(',')}) ON CONFLICT (id) DO NOTHING`,
          cols.map((k) => f[k]),
        );
      }
      await c.query(`SELECT setval(pg_get_serial_sequence('"${t}"','id'), COALESCE((SELECT MAX(id) FROM "${t}"),1))`);
      const { rows } = await c.query(`SELECT COUNT(*)::int AS n FROM "${t}"`);
      console.log(`${t}: ${filas.length} en respaldo, ${rows[0].n} en destino`);
    }
    await c.query('COMMIT');
  } catch (e) {
    await c.query('ROLLBACK');
    throw e;
  } finally {
    await c.end();
  }
}

const modo = process.argv[2];
({ backup, restore }[modo] ?? (() => Promise.reject(new Error('Uso: backup | restore'))))().catch((e) => {
  console.error('Error:', e.message);
  process.exit(1);
});
