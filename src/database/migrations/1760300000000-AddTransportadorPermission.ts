import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Permiso del módulo Transportador (recurso "transportador"): por ahora solo Admin.
 * Se le dan las 4 acciones del recurso (Admin tiene todo el catálogo); solo "read" se usa.
 */
const PERMISSIONS = ["read", "write", "update", "delete"].map((a) => `transportador:${a}`);

export class AddTransportadorPermission1760300000000 implements MigrationInterface {
  name = "AddTransportadorPermission1760300000000";

  async up(queryRunner: QueryRunner): Promise<void> {
    for (const permission of PERMISSIONS) {
      await queryRunner.query(
        `INSERT INTO "role_permissions" (role_id, permission)
         SELECT id, $1 FROM "roles" WHERE name = 'Admin'
         ON CONFLICT DO NOTHING`,
        [permission],
      );
    }
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM "role_permissions" WHERE permission = ANY($1)`, [
      PERMISSIONS,
    ]);
  }
}
