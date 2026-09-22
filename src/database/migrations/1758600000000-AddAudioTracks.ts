import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAudioTracks1758600000000 implements MigrationInterface {
  name = "AddAudioTracks1758600000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "audio_tracks" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "label" varchar NOT NULL,
        "audio_key" varchar NOT NULL,
        "order" int NOT NULL DEFAULT 0,
        "song_id" uuid NOT NULL REFERENCES "songs"("id") ON DELETE CASCADE
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "audio_tracks"`);
  }
}
