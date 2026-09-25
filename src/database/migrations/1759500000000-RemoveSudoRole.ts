import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Se elimina el rol Sudo: en la práctica era igual a Admin (mismos permisos). Antes de borrarlo,
 * nadie pierde acceso:
 * - quien tenía Sudo pasa a tener Admin (si no lo tenía ya);
 * - Admin recibe cualquier permiso que Sudo tuviera y Admin no — en el seed son idénticos, pero
 *   en producción los permisos se editan desde "Roles y Permisos" y podrían haber divergido.
 * Borrar el rol elimina en cascada sus filas de role_permissions y user_roles.
 *
 * down() recrea Sudo con los permisos actuales de Admin, pero NO puede saber a quién estaba
 * asignado: esas personas quedan con Admin.
 */
export class RemoveSudoRole1759500000000 implements MigrationInterface {
  name = "RemoveSudoRole1759500000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    const sudo: Array<{ id: string }> = await queryRunner.query(
      `SELECT id FROM "roles" WHERE "name" = 'Sudo'`,
    );
    const admin: Array<{ id: string }> = await queryRunner.query(
      `SELECT id FROM "roles" WHERE "name" = 'Admin'`,
    );
    if (sudo.length === 0) return;
    if (admin.length === 0) {
      throw new Error("No existe el rol Admin: no se puede reasignar a quienes tienen Sudo");
    }
    const sudoId = sudo[0]!.id;
    const adminId = admin[0]!.id;

    await queryRunner.query(
      `INSERT INTO "role_permissions" ("role_id", "permission")
       SELECT $1, sp."permission" FROM "role_permissions" sp
       WHERE sp."role_id" = $2
         AND NOT EXISTS (
           SELECT 1 FROM "role_permissions" ap
           WHERE ap."role_id" = $1 AND ap."permission" = sp."permission"
         )`,
      [adminId, sudoId],
    );

    await queryRunner.query(
      `INSERT INTO "user_roles" ("user_id", "role_id")
       SELECT ur."user_id", $1 FROM "user_roles" ur
       WHERE ur."role_id" = $2
         AND NOT EXISTS (
           SELECT 1 FROM "user_roles" ua WHERE ua."user_id" = ur."user_id" AND ua."role_id" = $1
         )`,
      [adminId, sudoId],
    );

    await queryRunner.query(`DELETE FROM "roles" WHERE "id" = $1`, [sudoId]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const [sudoRole] = await queryRunner.query(
      `INSERT INTO "roles" ("name") VALUES ('Sudo') RETURNING id`,
    );
    await queryRunner.query(
      `INSERT INTO "role_permissions" ("role_id", "permission")
       SELECT $1, "permission" FROM "role_permissions"
       WHERE "role_id" = (SELECT id FROM "roles" WHERE "name" = 'Admin')`,
      [sudoRole.id],
    );
  }
}
