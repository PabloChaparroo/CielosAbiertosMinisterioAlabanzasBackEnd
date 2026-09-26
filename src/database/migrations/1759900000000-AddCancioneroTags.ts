import { MigrationInterface, QueryRunner } from "typeorm";

const BASE = ["Adoración", "Júbilo", "Navidad", "Sanidad", "Bautismo", "Comunión", "Entrega", "Gratitud"];

/**
 * Los 28 temas que usa el cancionero real de la iglesia, tal cual aparecen en el documento (sin
 * fusionar; Pablo los ordena después). Los valores van escritos acá y no importados de la entidad:
 * una migración tiene que seguir haciendo lo mismo aunque la entidad cambie más adelante.
 */
const NUEVOS = [
  "Fe", "Rendición", "Identidad", "Exaltación", "Búsqueda", "Alabanza", "Guerra Espiritual",
  "Avivamiento", "Servicio", "Victoria", "Milagros", "Esperanza", "Confianza", "Testimonio",
  "Fidelidad", "Espíritu Santo", "Protección", "Salvación", "Poder", "Redención", "Majestad",
  "Oración", "Reino de Dios", "Hambre espiritual", "Restauración", "Resurrección", "Humildad",
  "Consagración",
];

const list = (values: string[]) => values.map((v) => `'${v}'`).join(",");

export class AddCancioneroTags1759900000000 implements MigrationInterface {
  name = "AddCancioneroTags1759900000000";

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "tags" DROP CONSTRAINT "CHK_tags_valor"`);
    await queryRunner.query(
      `ALTER TABLE "tags" ADD CONSTRAINT "CHK_tags_valor" CHECK ("valor" IN (${list([...BASE, ...NUEVOS])}))`,
    );
    await queryRunner.query(
      `INSERT INTO "tags" ("valor") VALUES ${NUEVOS.map((v) => `('${v}')`).join(", ")} ON CONFLICT ("valor") DO NOTHING`,
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    // quita los temas nuevos (y sus asignaciones a canciones, por el ON DELETE CASCADE de song_tags)
    await queryRunner.query(`DELETE FROM "tags" WHERE "valor" IN (${list(NUEVOS)})`);
    await queryRunner.query(`ALTER TABLE "tags" DROP CONSTRAINT "CHK_tags_valor"`);
    await queryRunner.query(
      `ALTER TABLE "tags" ADD CONSTRAINT "CHK_tags_valor" CHECK ("valor" IN (${list(BASE)}))`,
    );
  }
}
