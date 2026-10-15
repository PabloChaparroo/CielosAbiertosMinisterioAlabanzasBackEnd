import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Notas del líder para el equipo en cada lista (pedido de Pablo): van al final del mensaje de
 * "Copiar equipo" ("Todos debemos estudiar los temas…"). null = sin notas.
 */
export class AddSetlistNotes1760900000000 implements MigrationInterface {
  name = "AddSetlistNotes1760900000000";

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "setlists" ADD COLUMN "notes" text NULL`);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "setlists" DROP COLUMN "notes"`);
  }
}
