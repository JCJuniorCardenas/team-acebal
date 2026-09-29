import { MigrationInterface, QueryRunner } from 'typeorm';

export class MultiUsuario1790800000000 implements MigrationInterface {
  name = 'MultiUsuario1790800000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "usuario" ADD "nombre" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "usuario" ADD "emailVerificado" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "usuario" ADD "verificationToken" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "usuario" ADD "verificationTokenExpira" TIMESTAMP`,
    );
    // Las cuentas que ya existían (ej. el admin) se consideran verificadas.
    await queryRunner.query(`UPDATE "usuario" SET "emailVerificado" = true`);

    await queryRunner.query(`ALTER TABLE "alumno" ADD "usuarioId" integer`);
    // Los alumnos que ya existían quedan asignados al primer usuario (el admin),
    // para no perder datos ya cargados en producción.
    await queryRunner.query(
      `UPDATE "alumno" SET "usuarioId" = (SELECT id FROM "usuario" ORDER BY id ASC LIMIT 1) WHERE "usuarioId" IS NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "alumno" ALTER COLUMN "usuarioId" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "alumno" ADD CONSTRAINT "FK_alumno_usuario" FOREIGN KEY ("usuarioId") REFERENCES "usuario"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alumno" DROP CONSTRAINT "FK_alumno_usuario"`,
    );
    await queryRunner.query(`ALTER TABLE "alumno" DROP COLUMN "usuarioId"`);
    await queryRunner.query(
      `ALTER TABLE "usuario" DROP COLUMN "verificationTokenExpira"`,
    );
    await queryRunner.query(
      `ALTER TABLE "usuario" DROP COLUMN "verificationToken"`,
    );
    await queryRunner.query(
      `ALTER TABLE "usuario" DROP COLUMN "emailVerificado"`,
    );
    await queryRunner.query(`ALTER TABLE "usuario" DROP COLUMN "nombre"`);
  }
}
