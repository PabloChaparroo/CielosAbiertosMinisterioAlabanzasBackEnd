import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * "Instrumentos" deja de ser un atributo del integrante: el rol en el ministerio
 * (ministryRole: Guitarrista, Bajista…) ya cubre esa información.
 * El down() recrea la columna vacía — los valores que había no se recuperan.
 */
export class DropUserInstruments1759300000000 implements MigrationInterface {
  name = "DropUserInstruments1759300000000";

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "instruments"`);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ADD COLUMN "instruments" text[] NOT NULL DEFAULT '{}'`,
    );
  }
}
