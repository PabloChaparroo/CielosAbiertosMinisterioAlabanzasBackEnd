import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Sección de cada canción en el orden del servicio (pedido de Pablo): "alabanza", "adoracion" u
 * "ofrenda" en Cultos y Ensayos; null en Evento Especial y en las listas anteriores (el frontend
 * las agrupa por el tipo de la canción). Las listas predefinidas la guardan en su jsonb `items`.
 */
export class AddSetlistItemSection1760800000000 implements MigrationInterface {
  name = "AddSetlistItemSection1760800000000";

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "setlist_items" ADD COLUMN "section" varchar NULL`);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "setlist_items" DROP COLUMN "section"`);
  }
}
