import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * "Rol en el ministerio" (Guitarrista, Vocalista…) deja de ser un atributo del integrante:
 * lo que importa es el rol del sistema (user_roles), que se elige al crearlo.
 * El down() recrea la columna con '' — los valores que había no se recuperan.
 */
export class DropUserMinistryRole1759400000000 implements MigrationInterface {
  name = "DropUserMinistryRole1759400000000";

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "ministry_role"`);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" ADD COLUMN "ministry_role" varchar NOT NULL DEFAULT ''`);
  }
}
