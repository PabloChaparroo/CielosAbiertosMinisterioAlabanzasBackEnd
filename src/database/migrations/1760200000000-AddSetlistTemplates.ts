import { MigrationInterface, QueryRunner } from "typeorm";

/** Listas predefinidas: canciones reutilizables para armar setlists, sin fecha ni equipo */
export class AddSetlistTemplates1760200000000 implements MigrationInterface {
  name = "AddSetlistTemplates1760200000000";

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "setlist_templates" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "title" varchar NOT NULL,
        "items" jsonb NOT NULL DEFAULT '[]',
        "fecha_hora_alta" timestamptz NOT NULL DEFAULT now(),
        "fecha_hora_modificacion" timestamptz NOT NULL DEFAULT now(),
        "fecha_hora_baja" timestamptz,
        CONSTRAINT "PK_setlist_templates" PRIMARY KEY ("id")
      )
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "setlist_templates"`);
  }
}
