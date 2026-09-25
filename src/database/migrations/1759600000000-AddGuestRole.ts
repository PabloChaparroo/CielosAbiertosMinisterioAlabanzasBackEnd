import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Rol "Invitado" para el acceso sin usuario ni contraseña (POST /auth/invitado). Arranca solo
 * con cancion:read (canciones, letras y acordes); se ajusta desde "Roles y Permisos", pero de
 * este rol solo valen los permisos de lectura. Borrarlo deshabilita el acceso de invitados.
 * Ver src/common/authorization/guest.ts.
 */
export class AddGuestRole1759600000000 implements MigrationInterface {
  name = "AddGuestRole1759600000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    const [role] = await queryRunner.query(
      `INSERT INTO "roles" ("name") VALUES ('Invitado') RETURNING id`,
    );
    await queryRunner.query(
      `INSERT INTO "role_permissions" ("role_id", "permission") VALUES ($1, 'cancion:read')`,
      [role.id],
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // ON DELETE CASCADE en role_permissions.role_id se encarga de sus permisos
    await queryRunner.query(`DELETE FROM "roles" WHERE "name" = 'Invitado'`);
  }
}
