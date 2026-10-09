import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * "Próxima a sacar" (pedido de Pablo): desde cuándo la canción está marcada para sacar. Deja de
 * ser próxima sola cuando una lista de canciones que la tiene, con fecha desde la marca, pasa al
 * historial (se calcula al leer: ver SongsService.withEsProxima). null = no está marcada.
 */
export class AddSongProximaDesde1760700000000 implements MigrationInterface {
  name = "AddSongProximaDesde1760700000000";

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "songs" ADD COLUMN "proxima_desde" timestamptz NULL`);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "songs" DROP COLUMN "proxima_desde"`);
  }
}
