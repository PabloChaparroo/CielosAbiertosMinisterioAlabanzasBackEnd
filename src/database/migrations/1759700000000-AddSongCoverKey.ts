import { MigrationInterface, QueryRunner } from "typeorm";

/** Portada real de la canción (imagen en el bucket). Sin portada, se sigue usando `cover` (gradiente). */
export class AddSongCoverKey1759700000000 implements MigrationInterface {
  name = "AddSongCoverKey1759700000000";

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "songs" ADD COLUMN "cover_key" varchar`);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "songs" DROP COLUMN "cover_key"`);
  }
}
