import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Instrumentos (pedido de Pablo): qué toca cada miembro del equipo (`users.instruments`, puede ser
 * más de uno) y qué toca cada uno en una lista de canciones en particular
 * (`setlists.team_instruments`, { [userId]: instrumentos }). Los valores válidos están en
 * `modules/users/instruments.ts` y se validan en la API (no con un CHECK, para poder sumar
 * instrumentos sin migración).
 */
export class AddInstruments1760500000000 implements MigrationInterface {
  name = "AddInstruments1760500000000";

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ADD COLUMN "instruments" text[] NOT NULL DEFAULT '{}'`,
    );
    await queryRunner.query(
      `ALTER TABLE "setlists" ADD COLUMN "team_instruments" jsonb NOT NULL DEFAULT '{}'`,
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "setlists" DROP COLUMN "team_instruments"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "instruments"`);
  }
}
