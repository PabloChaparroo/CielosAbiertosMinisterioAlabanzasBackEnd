import "reflect-metadata";
import * as bcrypt from "bcrypt";
import { AppDataSource } from "../../config/data-source";

/**
 * Crea el PRIMER Admin en una base nueva (ej. producción en Neon, que arranca sin usuarios:
 * las migraciones crean roles y temas, pero ningún integrante). Se corre una sola vez, a mano,
 * desde una terminal con las variables de la base destino:
 *
 *   ADMIN_EMAIL=… ADMIN_NAME="…" ADMIN_PASSWORD=… npm run admin:create
 *   (más DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME y DB_SSL=true para Neon)
 *
 * - Si ya hay un Admin activo, no hace nada (se puede correr de nuevo sin riesgo).
 * - La contraseña nunca se imprime ni se guarda en texto plano (bcrypt, igual que el alta).
 * - Distinto de seed:run, que carga datos de DEMO con una contraseña conocida por todos:
 *   seed:run NUNCA se corre contra producción. Ver docs/estado-actual.md.
 */
const SALT_ROUNDS = 10;
const MIN_PASSWORD_LENGTH = 10;

function initialsFor(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join("");
}

async function main() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const name = process.env.ADMIN_NAME?.trim();
  const password = process.env.ADMIN_PASSWORD ?? "";
  if (!email || !name || !password) {
    throw new Error("Faltan variables: ADMIN_EMAIL, ADMIN_NAME y ADMIN_PASSWORD son obligatorias.");
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    throw new Error(`ADMIN_PASSWORD tiene que tener al menos ${MIN_PASSWORD_LENGTH} caracteres.`);
  }

  const opts = AppDataSource.options as { host?: string; database?: string; ssl?: unknown };
  console.log(`[admin] base destino: ${opts.host}/${opts.database} (SSL: ${opts.ssl ? "sí" : "no"})`);

  await AppDataSource.initialize();
  try {
    const [adminRole] = await AppDataSource.query<Array<{ id: string }>>(
      `SELECT id FROM "roles" WHERE "name" = 'Admin'`,
    );
    if (!adminRole) {
      throw new Error("No existe el rol Admin: ¿corriste las migraciones contra esta base?");
    }

    const existingAdmins = await AppDataSource.query<Array<{ email: string }>>(
      `SELECT u.email FROM "users" u
       JOIN "user_roles" ur ON ur.user_id = u.id
       WHERE ur.role_id = $1 AND u.fecha_hora_baja IS NULL`,
      [adminRole.id],
    );
    if (existingAdmins.length > 0) {
      console.log(
        `[admin] ya hay ${existingAdmins.length} Admin activo (${existingAdmins.map((a) => a.email).join(", ")}): no se hizo nada.`,
      );
      return;
    }

    const [emailTaken] = await AppDataSource.query<Array<{ id: string }>>(
      `SELECT id FROM "users" WHERE lower("email") = $1`,
      [email],
    );
    if (emailTaken) {
      throw new Error(`Ya existe un integrante con el email ${email} (no es Admin): asignale el rol desde la app.`);
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    await AppDataSource.transaction(async (manager) => {
      const [user] = await manager.query<Array<{ id: string }>>(
        `INSERT INTO "users" ("email", "password_hash", "name", "avatar_color", "initials")
         VALUES ($1, $2, $3, $4, $5) RETURNING id`,
        [email, passwordHash, name, "linear-gradient(135deg,#f5c76a,#e08b3a)", initialsFor(name)],
      );
      await manager.query(`INSERT INTO "user_roles" ("user_id", "role_id") VALUES ($1, $2)`, [
        user!.id,
        adminRole.id,
      ]);
    });
    console.log(`[admin] Admin creado: ${email}. Ya podés iniciar sesión con esa cuenta.`);
  } finally {
    await AppDataSource.destroy();
  }
}

main().catch((err: unknown) => {
  console.error(`[admin] ${err instanceof Error ? err.message : err}`);
  process.exit(1);
});
