# Backend — Team Acebal

API para gestionar alumnos, pagos y graduaciones de la academia.

## Stack

- NestJS + TypeScript
- TypeORM + PostgreSQL
- JWT (passport-jwt) para autenticación
- class-validator / class-transformer

## Requisitos

- Node.js 20 o superior
- PostgreSQL (local o un contenedor Docker)

## Instalación local

1. `npm install`
2. Copiar `.env.example` a `.env` y completar las credenciales.
3. Levantar Postgres si no tenés uno corriendo, por ejemplo:
   ```bash
   docker run -d --name team-acebal-postgres \
     -e POSTGRES_USER=team_acebal \
     -e POSTGRES_PASSWORD=team_acebal_dev \
     -e POSTGRES_DB=team_acebal \
     -p 5432:5432 postgres:16-alpine
   ```
   (ajustá `DB_*` en `.env` si usás otro puerto/usuario)
4. Aplicar las migraciones: `npm run migration:run`
5. Iniciar con `npm run start:dev`

La API estará en `http://localhost:3000`.

## Esquema de base de datos

El esquema se maneja **siempre por migraciones** (no se usa `synchronize` en
ningún entorno, ni siquiera en desarrollo). Si cambiás una entidad:

```bash
npm run migration:generate  # compara entidades vs. la DB y genera el SQL
npm run migration:run       # aplica migraciones pendientes
npm run migration:revert    # deshace la última migración
```

Al arrancar (`main.ts`), el backend corre las migraciones pendientes
automáticamente antes de levantar el servidor.

## Usuario administrador

Se crea/actualiza solo al arrancar, usando `ADMIN_EMAIL`/`ADMIN_PASSWORD` del
`.env`. Para cambiar la contraseña del admin, cambiá `ADMIN_PASSWORD` y
reiniciá el servicio — no hace falta correr ningún script.

## Tests

```bash
npm run test        # unitarios
npm run test:cov    # con cobertura
npm run test:e2e    # e2e (ver nota abajo)
```

El test e2e (`test/app.e2e-spec.ts`) está con `describe.skip`: dos
dependencias (`@nestjs/config`, `@nestjs/mapped-types`) se publican como ESM
puro y chocan con Jest en modo CommonJS al armar la app completa para el
test. El detalle técnico está documentado en el propio archivo.
