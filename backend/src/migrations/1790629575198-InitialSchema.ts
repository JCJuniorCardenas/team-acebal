import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1790629575198 implements MigrationInterface {
  name = 'InitialSchema1790629575198';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "pago" ("id" SERIAL NOT NULL, "montoPagado" numeric(10,2) NOT NULL, "fechaPago" date NOT NULL, "proximaFechaVencimiento" date NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "alumnoId" integer NOT NULL, CONSTRAINT "PK_6be14be998d5e41f10e58c0e651" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "graduacion" ("id" SERIAL NOT NULL, "grado" character varying NOT NULL, "stripe" character varying, "fechaGraduacion" date NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "alumnoId" integer NOT NULL, CONSTRAINT "PK_5e4c08b8d0542176b586b3cc2a8" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "alumno" ("id" SERIAL NOT NULL, "nombre" character varying NOT NULL, "apellido" character varying, "telefono" character varying, "fechaNacimiento" date, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_7f3dc49afa47af23777d1ddf00c" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "usuario" ("id" SERIAL NOT NULL, "email" character varying NOT NULL, "password" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_2863682842e688ca198eb25c124" UNIQUE ("email"), CONSTRAINT "PK_a56c58e5cabaa04fb2c98d2d7e2" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "pago" ADD CONSTRAINT "FK_96a0187f1fb8a4b3b619a4018e0" FOREIGN KEY ("alumnoId") REFERENCES "alumno"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "graduacion" ADD CONSTRAINT "FK_82ca3ad5bf5a137e2fdf8f9a91d" FOREIGN KEY ("alumnoId") REFERENCES "alumno"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "graduacion" DROP CONSTRAINT "FK_82ca3ad5bf5a137e2fdf8f9a91d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "pago" DROP CONSTRAINT "FK_96a0187f1fb8a4b3b619a4018e0"`,
    );
    await queryRunner.query(`DROP TABLE "usuario"`);
    await queryRunner.query(`DROP TABLE "alumno"`);
    await queryRunner.query(`DROP TABLE "graduacion"`);
    await queryRunner.query(`DROP TABLE "pago"`);
  }
}
