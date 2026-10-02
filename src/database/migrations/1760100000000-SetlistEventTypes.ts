import { MigrationInterface, QueryRunner } from "typeorm";

const NEW_TYPES =
  "'Culto Domingo a la mañana','Culto Domingo a la tarde','Culto Miércoles','Culto Sábado Jóvenes','Ensayo','Evento Especial'";

/**
 * Tipos de evento de los setlists: "Culto Domingo" se divide en mañana y tarde, y se agregan
 * "Culto Miércoles" y "Culto Sábado Jóvenes". Los setlists que eran "Culto Domingo" pasan a
 * "Culto Domingo a la mañana".
 */
export class SetlistEventTypes1760100000000 implements MigrationInterface {
  name = "SetlistEventTypes1760100000000";

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "setlists" DROP CONSTRAINT IF EXISTS "CHK_setlists_type"`);
    await queryRunner.query(
      `UPDATE "setlists" SET "type" = 'Culto Domingo a la mañana' WHERE "type" = 'Culto Domingo'`,
    );
    await queryRunner.query(
      `ALTER TABLE "setlists" ADD CONSTRAINT "CHK_setlists_type" CHECK ("type" IN (${NEW_TYPES}))`,
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "setlists" DROP CONSTRAINT IF EXISTS "CHK_setlists_type"`);
    await queryRunner.query(
      `UPDATE "setlists" SET "type" = 'Culto Domingo' WHERE "type" LIKE 'Culto %'`,
    );
    await queryRunner.query(
      `ALTER TABLE "setlists" ADD CONSTRAINT "CHK_setlists_type" CHECK ("type" IN ('Culto Domingo','Ensayo','Evento Especial'))`,
    );
  }
}
