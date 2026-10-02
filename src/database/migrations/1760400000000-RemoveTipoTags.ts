import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * "Adoración" y "Alabanza" son TIPOS de canción (tipos_cancion), no temas: se sacan del catálogo de
 * temas (pedido de Pablo). Sus asignaciones a canciones se van con ellos (ON DELETE CASCADE de
 * song_tags); el tipo de cada canción no se toca. Los valores van escritos acá y no importados de
 * la entidad: una migración tiene que seguir haciendo lo mismo aunque la entidad cambie.
 */
const QUITADOS = ["Adoración", "Alabanza"];

const QUEDAN = [
  "Júbilo", "Navidad", "Sanidad", "Bautismo", "Comunión", "Entrega", "Gratitud",
  "Fe", "Rendición", "Identidad", "Exaltación", "Búsqueda", "Guerra Espiritual",
  "Avivamiento", "Servicio", "Victoria", "Milagros", "Esperanza", "Confianza", "Testimonio",
  "Fidelidad", "Espíritu Santo", "Protección", "Salvación", "Poder", "Redención", "Majestad",
  "Oración", "Reino de Dios", "Hambre espiritual", "Restauración", "Resurrección", "Humildad",
  "Consagración",
];

const list = (values: string[]) => values.map((v) => `'${v}'`).join(",");

export class RemoveTipoTags1760400000000 implements MigrationInterface {
  name = "RemoveTipoTags1760400000000";

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM "tags" WHERE "valor" IN (${list(QUITADOS)})`);
    await queryRunner.query(`ALTER TABLE "tags" DROP CONSTRAINT "CHK_tags_valor"`);
    await queryRunner.query(
      `ALTER TABLE "tags" ADD CONSTRAINT "CHK_tags_valor" CHECK ("valor" IN (${list(QUEDAN)}))`,
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    // vuelven los temas, pero sin las asignaciones a canciones que se borraron en `up`
    await queryRunner.query(`ALTER TABLE "tags" DROP CONSTRAINT "CHK_tags_valor"`);
    await queryRunner.query(
      `ALTER TABLE "tags" ADD CONSTRAINT "CHK_tags_valor" CHECK ("valor" IN (${list([...QUEDAN, ...QUITADOS])}))`,
    );
    await queryRunner.query(
      `INSERT INTO "tags" ("valor") VALUES ${QUITADOS.map((v) => `('${v}')`).join(", ")} ON CONFLICT ("valor") DO NOTHING`,
    );
  }
}
