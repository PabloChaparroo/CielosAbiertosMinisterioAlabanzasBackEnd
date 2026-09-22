import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1758540000000 implements MigrationInterface {
  name = "InitialSchema1758540000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`);

    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "email" varchar NOT NULL UNIQUE,
        "password_hash" varchar NOT NULL,
        "name" varchar NOT NULL,
        "role" varchar NOT NULL,
        "ministry_role" varchar NOT NULL,
        "instruments" text[] NOT NULL DEFAULT '{}',
        "avatar_color" varchar NOT NULL,
        "initials" varchar(4) NOT NULL,
        "fecha_hora_alta" timestamptz NOT NULL DEFAULT now(),
        "fecha_hora_modificacion" timestamptz NOT NULL DEFAULT now(),
        "fecha_hora_baja" timestamptz,
        CONSTRAINT "CHK_users_role" CHECK ("role" IN ('admin','lider','musico'))
      )
    `);

    // Catálogo de permisos: la tabla es editable en runtime, pero arranca con
    // el mapeo rol -> permisos ya vigente en el frontend mockeado (useApp.can()).
    await queryRunner.query(`
      CREATE TABLE "role_permissions" (
        "role" varchar NOT NULL,
        "permission" varchar NOT NULL,
        PRIMARY KEY ("role", "permission")
      )
    `);
    const resources = ["cancion", "setlist", "equipo", "anotacion", "anotacion-propia", "estadisticas"];
    const actions = ["read", "write", "update", "delete"];
    const rolePermissions: Array<[string, string]> = [];
    const grant = (role: string, resource: string, action: string) =>
      rolePermissions.push([role, `${resource}:${action}`]);

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

    const values = rolePermissions.map(([role, perm]) => `('${role}', '${perm}')`).join(",\n        ");
    await queryRunner.query(`
      INSERT INTO "role_permissions" ("role", "permission") VALUES
        ${values}
    `);

    await queryRunner.query(`
      CREATE TABLE "tags" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "valor" varchar NOT NULL UNIQUE,
        CONSTRAINT "CHK_tags_valor" CHECK ("valor" IN
          ('Adoración','Júbilo','Navidad','Sanidad','Bautismo','Comunión','Entrega','Gratitud'))
      )
    `);
    await queryRunner.query(`
      INSERT INTO "tags" ("valor") VALUES
        ('Adoración'), ('Júbilo'), ('Navidad'), ('Sanidad'),
        ('Bautismo'), ('Comunión'), ('Entrega'), ('Gratitud')
    `);

    await queryRunner.query(`
      CREATE TABLE "songs" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "title" varchar NOT NULL,
        "artist" varchar NOT NULL,
        "key" varchar NOT NULL,
        "bpm" int NOT NULL,
        "duration" int NOT NULL,
        "cover" varchar NOT NULL,
        "audio_key" varchar,
        "chordpro" text NOT NULL,
        "lyrics_image_key" varchar,
        "fecha_hora_alta" timestamptz NOT NULL DEFAULT now(),
        "fecha_hora_modificacion" timestamptz NOT NULL DEFAULT now(),
        "fecha_hora_baja" timestamptz
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "song_tags" (
        "song_id" uuid NOT NULL REFERENCES "songs"("id") ON DELETE CASCADE,
        "tag_id" uuid NOT NULL REFERENCES "tags"("id") ON DELETE CASCADE,
        PRIMARY KEY ("song_id", "tag_id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "song_play_stats" (
        "song_id" uuid NOT NULL REFERENCES "songs"("id") ON DELETE CASCADE,
        "month" varchar(7) NOT NULL,
        "plays" int NOT NULL DEFAULT 0,
        PRIMARY KEY ("song_id", "month")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "setlists" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "title" varchar NOT NULL,
        "date" timestamptz NOT NULL,
        "type" varchar NOT NULL,
        "leader_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE RESTRICT,
        "fecha_hora_alta" timestamptz NOT NULL DEFAULT now(),
        "fecha_hora_modificacion" timestamptz NOT NULL DEFAULT now(),
        "fecha_hora_baja" timestamptz,
        CONSTRAINT "CHK_setlists_type" CHECK ("type" IN ('Culto Domingo','Ensayo','Evento Especial'))
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "setlist_items" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "setlist_id" uuid NOT NULL REFERENCES "setlists"("id") ON DELETE CASCADE,
        "song_id" uuid NOT NULL REFERENCES "songs"("id") ON DELETE RESTRICT,
        "key" varchar NOT NULL,
        "note" text,
        "position" int NOT NULL
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "setlist_team_members" (
        "setlist_id" uuid NOT NULL REFERENCES "setlists"("id") ON DELETE CASCADE,
        "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        PRIMARY KEY ("setlist_id", "user_id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "annotations" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "song_id" uuid NOT NULL REFERENCES "songs"("id") ON DELETE CASCADE,
        "author_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "text" text NOT NULL,
        "fecha_hora_alta" timestamptz NOT NULL DEFAULT now(),
        "fecha_hora_modificacion" timestamptz NOT NULL DEFAULT now(),
        "fecha_hora_baja" timestamptz
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "favorites" (
        "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "song_id" uuid NOT NULL REFERENCES "songs"("id") ON DELETE CASCADE,
        "fecha_hora_alta" timestamptz NOT NULL DEFAULT now(),
        PRIMARY KEY ("user_id", "song_id")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "favorites"`);
    await queryRunner.query(`DROP TABLE "annotations"`);
    await queryRunner.query(`DROP TABLE "setlist_team_members"`);
    await queryRunner.query(`DROP TABLE "setlist_items"`);
    await queryRunner.query(`DROP TABLE "setlists"`);
    await queryRunner.query(`DROP TABLE "song_play_stats"`);
    await queryRunner.query(`DROP TABLE "song_tags"`);
    await queryRunner.query(`DROP TABLE "songs"`);
    await queryRunner.query(`DROP TABLE "tags"`);
    await queryRunner.query(`DROP TABLE "role_permissions"`);
    await queryRunner.query(`DROP TABLE "users"`);
  }
}
