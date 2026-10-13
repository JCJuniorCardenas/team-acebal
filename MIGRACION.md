# Migración de la base de datos: Render → Neon

## Qué se cambió en el código
- `backend/src/app.module.ts`: SSL con verificación de certificado, timeouts de conexión (15 s), reintentos al arrancar y cierre de conexiones inactivas a los 30 s (Neon suspende la base tras ~5 min sin uso).
- `backend/src/data-source.ts`: las migraciones usan `DATABASE_URL_DIRECT` (conexión directa de Neon, sin `-pooler`); si no existe, usan `DATABASE_URL`.
- `backend/src/main.ts`: reintenta la primera conexión antes de correr migraciones.
- `backend/src/health/`: `GET /health` (no toca la base) y `GET /health/warmup` (hace `SELECT 1`).
- `backend/scripts/copiar-datos.js`: respaldo y carga de datos sin necesitar `pg_dump`.
- `synchronize` ya estaba en `false`: el esquema se maneja solo con migraciones.

## Variables de entorno
| Variable | Qué es |
|---|---|
| `DATABASE_URL` | Conexión de Neon (con `sslmode=require`). La usa la app. |
| `DATABASE_URL_DIRECT` | Conexión directa de Neon (sin `-pooler`). La usan las migraciones. |
| `OLD_DATABASE_URL` | Solo para el respaldo: URL externa de la base de Render. No subir a Render. |

## Pasos de la migración
1. `cd backend`
2. Respaldo de Render: `node scripts/copiar-datos.js backup` (crea `backups/respaldo.json`, ignorado por git).
3. Crear tablas en Neon: `npm run migration:run`
4. Cargar los datos: `node scripts/copiar-datos.js restore`
5. Probar en local: `npm run start:dev` y abrir `/health` y `/health/warmup`.
6. Cambiar `DATABASE_URL` (y `DATABASE_URL_DIRECT`) en Render y redeployar.

## Cómo volver atrás
La base de Render no se toca. Para volver: en Render, poner de nuevo la `DATABASE_URL` anterior y redeployar. Los datos cargados después de la migración quedarían solo en Neon.
