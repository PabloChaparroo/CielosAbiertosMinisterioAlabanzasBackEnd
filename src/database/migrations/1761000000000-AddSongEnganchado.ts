import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * "Enganchado" (pedido de Pablo): un audio con varios temas. Sirve para que las listas generadas
 * no cuenten un enganchado como una sola canción. null = sin evaluar (la app lo mide por la
 * duración: alabanza de más de 10 minutos), true/false = decidido.
 */
export class AddSongEnganchado1761000000000 implements MigrationInterface {
  name = "AddSongEnganchado1761000000000";

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "songs" ADD COLUMN "enganchado" boolean NULL`);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "songs" DROP COLUMN "enganchado"`);
  }
}
