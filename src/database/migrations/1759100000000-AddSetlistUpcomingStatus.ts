import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSetlistUpcomingStatus1759100000000 implements MigrationInterface {
  name = "AddSetlistUpcomingStatus1759100000000";

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "setlists" ADD "is_upcoming" boolean NOT NULL DEFAULT false`,
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "setlists" DROP COLUMN "is_upcoming"`);
  }
}
