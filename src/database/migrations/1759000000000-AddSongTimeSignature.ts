import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSongTimeSignature1759000000000 implements MigrationInterface {
  name = "AddSongTimeSignature1759000000000";

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "songs" ADD "compas" varchar NOT NULL DEFAULT '4/4'`,
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "songs" DROP COLUMN "compas"`);
  }
}
