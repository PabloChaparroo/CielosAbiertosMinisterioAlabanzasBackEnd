import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Nombre propio del audio principal de la canción (pedido de Pablo: "Audio Quién podrá",
 * "Guitarra Quién podrá"…). null = se muestra con el título de la canción, como hasta ahora.
 */
export class AddSongAudioName1760600000000 implements MigrationInterface {
  name = "AddSongAudioName1760600000000";

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "songs" ADD COLUMN "audio_name" varchar NULL`);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "songs" DROP COLUMN "audio_name"`);
  }
}
