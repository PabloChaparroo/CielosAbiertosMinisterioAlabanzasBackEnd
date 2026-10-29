import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Músico sin el módulo "Equipo y Roles" (pedido de Pablo): AddRolesAndPermissions le dio
 * equipo:read y con eso el menú le mostraba el módulo. No lo necesita: el equipo de cada lista
 * le llega con la propia lista (ver withPublicTeam en setlists).
 */
export class RemoveMusicoEquipoRead1761100000000 implements MigrationInterface {
  name = "RemoveMusicoEquipoRead1761100000000";

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM "role_permissions"
       WHERE permission = 'equipo:read'
         AND role_id = (SELECT id FROM "roles" WHERE name = 'Músico')`,
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `INSERT INTO "role_permissions" (role_id, permission)
       SELECT id, 'equipo:read' FROM "roles" WHERE name = 'Músico'
       ON CONFLICT DO NOTHING`,
    );
  }
}
