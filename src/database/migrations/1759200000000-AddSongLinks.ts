import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSongLinks1759200000000 implements MigrationInterface {
  name = "AddSongLinks1759200000000";

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "song_links" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "label" varchar NOT NULL,
        "url" varchar NOT NULL,
        "type" varchar,
        "order" int NOT NULL DEFAULT 0,
        "song_id" uuid NOT NULL REFERENCES "songs"("id") ON DELETE CASCADE
      )
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "song_links"`);
  }
}
