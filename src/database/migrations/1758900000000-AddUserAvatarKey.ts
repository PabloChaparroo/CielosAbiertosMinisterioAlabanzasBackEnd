import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUserAvatarKey1758900000000 implements MigrationInterface {
  name = "AddUserAvatarKey1758900000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" ADD "avatar_key" varchar`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "avatar_key"`);
  }
}
