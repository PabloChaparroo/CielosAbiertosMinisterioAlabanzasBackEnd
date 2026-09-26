import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Tipo de canción (Alabanza / Adoración), obligatorio. Las canciones que ya existían quedan como
 * "Alabanza" (decisión de Pablo) y se corrigen a mano desde la app.
 */
export class AddTipoCancion1759800000000 implements MigrationInterface {
  name = "AddTipoCancion1759800000000";

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "tipos_cancion" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "nombre" varchar NOT NULL UNIQUE
      )
    `);
    await queryRunner.query(
      `INSERT INTO "tipos_cancion" ("nombre") VALUES ('Alabanza'), ('Adoración')`,
    );
    await queryRunner.query(`ALTER TABLE "songs" ADD COLUMN "tipo_id" uuid`);
    await queryRunner.query(
      `UPDATE "songs" SET "tipo_id" = (SELECT "id" FROM "tipos_cancion" WHERE "nombre" = 'Alabanza')`,
    );
    await queryRunner.query(`ALTER TABLE "songs" ALTER COLUMN "tipo_id" SET NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "songs" ADD CONSTRAINT "FK_songs_tipo" FOREIGN KEY ("tipo_id") REFERENCES "tipos_cancion"("id")`,
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "songs" DROP CONSTRAINT "FK_songs_tipo"`);
    await queryRunner.query(`ALTER TABLE "songs" DROP COLUMN "tipo_id"`);
    await queryRunner.query(`DROP TABLE "tipos_cancion"`);
  }
}
