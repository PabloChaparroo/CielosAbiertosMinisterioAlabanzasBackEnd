import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Músico ve el módulo Estadísticas (pedido de Pablo). AddRolesAndPermissions ya se lo daba, pero en
 * producción no lo tenía (se puede apagar desde Roles y Permisos): esto lo vuelve a dar. Si ya lo
 * tiene, no cambia nada. La pantalla solo usa canciones y listas, que Músico ya puede ver.
 */
export class GrantMusicoEstadisticasRead1761200000000 implements MigrationInterface {
  name = "GrantMusicoEstadisticasRead1761200000000";

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `INSERT INTO "role_permissions" (role_id, permission)
       SELECT id, 'estadisticas:read' FROM "roles" WHERE name = 'Músico'
       ON CONFLICT DO NOTHING`,
    );
  }

  // no se saca en el down: el permiso venía de antes y no se sabe si producción lo tenía
  async down(): Promise<void> {}
}
