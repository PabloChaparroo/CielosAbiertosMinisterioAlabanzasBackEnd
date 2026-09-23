import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Reemplaza el sistema de roles fijo (users.role con @Check admin/lider/musico
 * + role_permissions keyeada por ese string) por un modelo dinámico: Role es
 * texto libre creado desde la pantalla de administración, con User↔Role M:N
 * (sin ventana de vigencia — decisión explícita: alcanza con la relación
 * simple) y Rol↔Permiso M:N vía role_permissions (ahora referenciando
 * roles.id en vez de un string fijo).
 *
 * Se migran los usuarios existentes a los 3 roles equivalentes (Admin/Líder/
 * Músico) con los mismos permisos que ya tenían, para no romper el
 * comportamiento del día 1.
 */
export class AddRolesAndPermissions1758700000000 implements MigrationInterface {
  name = "AddRolesAndPermissions1758700000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "roles" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "name" varchar NOT NULL UNIQUE
      )
    `);
    const seededRoles: Array<{ id: string; name: string }> = await queryRunner.query(`
      INSERT INTO "roles" ("name") VALUES ('Admin'), ('Líder'), ('Músico')
      RETURNING id, name
    `);
    const roleIdByName = new Map(seededRoles.map((r) => [r.name, r.id]));
    const adminId = roleIdByName.get("Admin")!;
    const liderId = roleIdByName.get("Líder")!;
    const musicoId = roleIdByName.get("Músico")!;

    await queryRunner.query(`DROP TABLE "role_permissions"`);
    await queryRunner.query(`
      CREATE TABLE "role_permissions" (
        "role_id" uuid NOT NULL REFERENCES "roles"("id") ON DELETE CASCADE,
        "permission" varchar NOT NULL,
        PRIMARY KEY ("role_id", "permission")
      )
    `);

    const resources = [
      "cancion",
      "setlist",
      "equipo",
      "anotacion",
      "anotacion-propia",
      "estadisticas",
      "rol",
    ];
    const actions = ["read", "write", "update", "delete"];
    const grants: Array<[string, string]> = [];
    const grant = (roleId: string, resource: string, action: string) =>
      grants.push([roleId, `${resource}:${action}`]);

    for (const resource of resources) {
      for (const action of actions) grant(adminId, resource, action);
    }
    for (const resource of ["cancion", "setlist", "anotacion"]) {
      for (const action of actions) grant(liderId, resource, action);
    }
    grant(liderId, "equipo", "read");
    grant(liderId, "anotacion-propia", "update");
    grant(liderId, "anotacion-propia", "delete");
    grant(liderId, "estadisticas", "read");

    grant(musicoId, "cancion", "read");
    grant(musicoId, "setlist", "read");
    grant(musicoId, "equipo", "read");
    grant(musicoId, "anotacion", "read");
    grant(musicoId, "anotacion-propia", "write");
    grant(musicoId, "anotacion-propia", "update");
    grant(musicoId, "anotacion-propia", "delete");
    grant(musicoId, "estadisticas", "read");

    const grantValues = grants.map(([roleId, perm]) => `('${roleId}', '${perm}')`).join(",\n        ");
    await queryRunner.query(`
      INSERT INTO "role_permissions" ("role_id", "permission") VALUES
        ${grantValues}
    `);

    await queryRunner.query(`
      CREATE TABLE "user_roles" (
        "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "role_id" uuid NOT NULL REFERENCES "roles"("id") ON DELETE CASCADE,
        PRIMARY KEY ("user_id", "role_id")
      )
    `);
    await queryRunner.query(`
      INSERT INTO "user_roles" ("user_id", "role_id")
      SELECT u."id", r."id"
      FROM "users" u
      JOIN "roles" r ON r."name" = CASE u."role"
        WHEN 'admin' THEN 'Admin'
        WHEN 'lider' THEN 'Líder'
        WHEN 'musico' THEN 'Músico'
      END
    `);

    await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "CHK_users_role"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "role"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" ADD COLUMN "role" varchar`);
    // Si un usuario tiene varios roles, prioriza Admin > Líder > Músico para
    // volver a la columna única; si no tiene ninguno, cae en 'musico'.
    await queryRunner.query(`
      UPDATE "users" SET "role" = COALESCE(
        (
          SELECT CASE r."name" WHEN 'Admin' THEN 'admin' WHEN 'Líder' THEN 'lider' WHEN 'Músico' THEN 'musico' END
          FROM "user_roles" ur
          JOIN "roles" r ON r."id" = ur."role_id"
          WHERE ur."user_id" = "users"."id"
          ORDER BY CASE r."name" WHEN 'Admin' THEN 1 WHEN 'Líder' THEN 2 WHEN 'Músico' THEN 3 ELSE 4 END
          LIMIT 1
        ),
        'musico'
      )
    `);
    await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "role" SET NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "CHK_users_role" CHECK ("role" IN ('admin','lider','musico'))`,
    );

    await queryRunner.query(`DROP TABLE "user_roles"`);
    await queryRunner.query(`DROP TABLE "role_permissions"`);
    await queryRunner.query(`
      CREATE TABLE "role_permissions" (
        "role" varchar NOT NULL,
        "permission" varchar NOT NULL,
        PRIMARY KEY ("role", "permission")
      )
    `);
    const resources = ["cancion", "setlist", "equipo", "anotacion", "anotacion-propia", "estadisticas"];
    const actions = ["read", "write", "update", "delete"];
    const grants: Array<[string, string]> = [];
    const grant = (role: string, resource: string, action: string) =>
      grants.push([role, `${resource}:${action}`]);
    for (const resource of resources) {
      for (const action of actions) grant("admin", resource, action);
    }
    for (const resource of ["cancion", "setlist", "anotacion"]) {
      for (const action of actions) grant("lider", resource, action);
    }
    grant("lider", "equipo", "read");
    grant("lider", "anotacion-propia", "update");
    grant("lider", "anotacion-propia", "delete");
    grant("lider", "estadisticas", "read");
    grant("musico", "cancion", "read");
    grant("musico", "setlist", "read");
    grant("musico", "equipo", "read");
    grant("musico", "anotacion", "read");
    grant("musico", "anotacion-propia", "write");
    grant("musico", "anotacion-propia", "update");
    grant("musico", "anotacion-propia", "delete");
    grant("musico", "estadisticas", "read");
    const values = grants.map(([role, perm]) => `('${role}', '${perm}')`).join(",\n        ");
    await queryRunner.query(`INSERT INTO "role_permissions" ("role", "permission") VALUES ${values}`);

    await queryRunner.query(`DROP TABLE "roles"`);
  }
}
