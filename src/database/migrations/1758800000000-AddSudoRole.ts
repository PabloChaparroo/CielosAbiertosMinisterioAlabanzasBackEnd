import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Rol de soporte técnico con TODOS los permisos del catálogo, sin excepción
 * (incluido rol:write). Snapshot fijo, igual que Admin/Líder/Músico: si el
 * catálogo crece (nuevo recurso), esta migración NO se actualiza sola — hace
 * falta una migración nueva que le otorgue el permiso nuevo a Sudo (y a los
 * demás roles que corresponda), tal como ya pasó cuando se agregó el recurso
 * "rol". Se documenta explícitamente en docs/estado-actual.md para no
 * asumir que Sudo "ya tiene todo" automáticamente en el futuro.
 *
 * Se asigna a Ana Ferrari (ana@cielosabiertos.org), reemplazando su rol
 * Músico — no a Martín (se mantiene como único ejemplo de Admin) ni a
 * Joaquín (referencia de "Músico sin permisos"). Líder queda con sus dos
 * ejemplos (Sofía, Lucía) y Músico con cuatro (Joaquín, Camila, Nicolás,
 * Diego) — ningún rol original queda sin representante en el seed.
 */
export class AddSudoRole1758800000000 implements MigrationInterface {
  name = "AddSudoRole1758800000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    const [sudoRole] = await queryRunner.query(`
      INSERT INTO "roles" ("name") VALUES ('Sudo')
      RETURNING id
    `);
    const sudoId: string = sudoRole.id;

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
    const grants: string[] = [];
    for (const resource of resources) {
      for (const action of actions) {
        grants.push(`('${sudoId}', '${resource}:${action}')`);
      }
    }
    await queryRunner.query(`
      INSERT INTO "role_permissions" ("role_id", "permission") VALUES
        ${grants.join(",\n        ")}
    `);

    // Si esta migración corre contra una base ya seedeada (como la de este
    // entorno), le hace el swap a Ana ahí mismo. Si corre contra una base
    // vacía (instalación nueva, seed todavía no ejecutado), este UPDATE no
    // afecta ninguna fila — run-seed.ts ya sabe darle "sudo" a Ana desde el
    // arranque, así que el resultado final es el mismo en ambos casos.
    const ana: Array<{ id: string }> = await queryRunner.query(`
      SELECT id FROM "users" WHERE "email" = 'ana@cielosabiertos.org'
    `);
    if (ana.length > 0) {
      const anaId = ana[0]!.id;
      await queryRunner.query(
        `DELETE FROM "user_roles" WHERE "user_id" = $1 AND "role_id" = (SELECT id FROM "roles" WHERE "name" = 'Músico')`,
        [anaId],
      );
      await queryRunner.query(`INSERT INTO "user_roles" ("user_id", "role_id") VALUES ($1, $2)`, [
        anaId,
        sudoId,
      ]);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const sudo: Array<{ id: string }> = await queryRunner.query(`
      SELECT id FROM "roles" WHERE "name" = 'Sudo'
    `);
    if (sudo.length > 0) {
      const sudoId = sudo[0]!.id;
      const ana: Array<{ id: string }> = await queryRunner.query(`
        SELECT id FROM "users" WHERE "email" = 'ana@cielosabiertos.org'
      `);
      if (ana.length > 0) {
        const anaId = ana[0]!.id;
        await queryRunner.query(
          `DELETE FROM "user_roles" WHERE "user_id" = $1 AND "role_id" = $2`,
          [anaId, sudoId],
        );
        await queryRunner.query(
          `INSERT INTO "user_roles" ("user_id", "role_id") VALUES ($1, (SELECT id FROM "roles" WHERE "name" = 'Músico'))`,
          [anaId],
        );
      }
    }

    // ON DELETE CASCADE en role_permissions.role_id se encarga de sus grants.
    await queryRunner.query(`DELETE FROM "roles" WHERE "name" = 'Sudo'`);
  }
}
