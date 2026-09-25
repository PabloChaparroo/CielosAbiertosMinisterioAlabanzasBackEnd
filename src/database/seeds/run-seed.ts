import "dotenv/config";
import * as bcrypt from "bcrypt";
import { AppDataSource } from "../../config/data-source";

/**
 * Seed de datos demo, migrado 1:1 desde src/mocks/data.ts del proyecto
 * frontend, para que el equipo pueda seguir probando la UI contra datos
 * reales apenas el backend esté conectado. Todos los usuarios demo comparten
 * la contraseña "cambiar123" (hasheada acá, nunca en texto plano en la DB).
 */

const DEMO_PASSWORD = "cambiar123";

interface DemoUser {
  id: string;
  email: string;
  name: string;
  role: "admin" | "lider" | "musico";
  avatarColor: string;
  initials: string;
}

const users: DemoUser[] = [
  {
    id: "11111111-0000-4000-8000-000000000001",
    email: "martin@cielosabiertos.org",
    name: "Martín Álvarez",
    role: "admin",
    avatarColor: "linear-gradient(135deg,#f5c76a,#e08b3a)",
    initials: "MA",
  },
  {
    id: "11111111-0000-4000-8000-000000000002",
    email: "sofia@cielosabiertos.org",
    name: "Sofía Ledesma",
    role: "lider",
    avatarColor: "linear-gradient(135deg,#7aa2f7,#8b5cf6)",
    initials: "SL",
  },
  {
    id: "11111111-0000-4000-8000-000000000003",
    email: "joaquin@cielosabiertos.org",
    name: "Joaquín Ruiz",
    role: "musico",
    avatarColor: "linear-gradient(135deg,#4ade80,#0ea5e9)",
    initials: "JR",
  },
  {
    id: "11111111-0000-4000-8000-000000000004",
    email: "camila@cielosabiertos.org",
    name: "Camila Ortiz",
    role: "musico",
    avatarColor: "linear-gradient(135deg,#f472b6,#f59e0b)",
    initials: "CO",
  },
  {
    id: "11111111-0000-4000-8000-000000000005",
    email: "nico@cielosabiertos.org",
    name: "Nicolás Pereyra",
    role: "musico",
    avatarColor: "linear-gradient(135deg,#38bdf8,#6366f1)",
    initials: "NP",
  },
  {
    id: "11111111-0000-4000-8000-000000000006",
    email: "lucia@cielosabiertos.org",
    name: "Lucía Fernández",
    role: "lider",
    avatarColor: "linear-gradient(135deg,#c084fc,#f472b6)",
    initials: "LF",
  },
  {
    id: "11111111-0000-4000-8000-000000000007",
    email: "diego@cielosabiertos.org",
    name: "Diego Sosa",
    role: "musico",
    avatarColor: "linear-gradient(135deg,#34d399,#22d3ee)",
    initials: "DS",
  },
  {
    id: "11111111-0000-4000-8000-000000000008",
    email: "ana@cielosabiertos.org",
    name: "Ana Ferrari",
    role: "admin",
    avatarColor: "linear-gradient(135deg,#fbbf24,#fb7185)",
    initials: "AF",
  },
];

const covers = [
  "linear-gradient(135deg,#1e3a8a,#7c3aed)",
  "linear-gradient(135deg,#b45309,#f59e0b)",
  "linear-gradient(135deg,#0f766e,#22d3ee)",
  "linear-gradient(135deg,#831843,#f472b6)",
  "linear-gradient(135deg,#1f2937,#4b5563)",
  "linear-gradient(135deg,#4c1d95,#2563eb)",
  "linear-gradient(135deg,#7c2d12,#ea580c)",
  "linear-gradient(135deg,#064e3b,#84cc16)",
];

const bodies = [
  `{estrofa 1}\n[G]Tú me llamas sobre las [D]aguas\ndonde mis pies pueden [Em7]fallar\ny allí te en[C]cuentro en el mis[G]terio\nen océanos ca[D]minaré\n\n{coro}\nTu [C]gracia me sos[G]tiene\ny en la tor[D]menta con[Em7]fiaré\nmis [C]ojos en Ti [G]puestos\nmi al[D]ma descansa[G]rá`,
  `{estrofa 1}\n[D]Digno de alabanza es el [A]Rey\n[Bm]toda la tierra can[G]tará\n[D]Santo, santo, santo es el [A]Señor\n[Bm]para siempre reina[G]rá\n\n{coro}\nLe[G]vantamos hoy tu [D]nombre\nno hay o[A]tro como [Bm]Tú\nLe[G]vantamos hoy tu [D]nombre\nCristo, [A]nuestra sal[D]vación`,
  `{estrofa 1}\n[C]Nada nos separa[G]rá\nde tu a[Am]mor, de tu a[F]mor\n[C]Ni la muerte ni la [G]vida\nni al[Am]tura ni pro[F]fundidad\n\n{coro}\n[F]Cantaré de tu [C]amor por siempre\n[G]cantaré de tu fideli[Am]dad\n[F]Cantaré que tus mise[C]ricordias\n[G]nuevas son cada maña[C]na`,
];

const titles: Array<[string, string, string, number, number, string[]]> = [
  ["Océanos", "Hillsong United", "G", 68, 512, ["Adoración", "Entrega"]],
  ["Digno de Alabanza", "Marco Barrientos", "D", 76, 348, ["Adoración", "Júbilo"]],
  ["Nada Nos Separará", "Marcos Witt", "C", 82, 372, ["Adoración", "Gratitud"]],
  ["Al Que Está Sentado", "Miel San Marcos", "A", 130, 296, ["Júbilo"]],
  ["Sana Nuestra Tierra", "Marco Barrientos", "E", 72, 405, ["Sanidad"]],
  ["Aguas Vivas", "Generación 12", "Bm", 74, 388, ["Bautismo", "Adoración"]],
  ["Renuévame", "Marcos Witt", "F", 66, 289, ["Entrega", "Sanidad"]],
  ["Gloria a Dios en las Alturas", "Coral Cielos", "G", 88, 264, ["Navidad"]],
  ["Noche de Paz Renovada", "Cielos Abiertos", "C", 60, 245, ["Navidad"]],
  ["Tu Mesa", "Averly Morillo", "D", 70, 401, ["Comunión"]],
  ["Cuán Grande Es Él", "Himno", "Bb", 64, 320, ["Adoración", "Gratitud"]],
  ["Espíritu Santo Ven", "Barak", "Am", 78, 430, ["Adoración"]],
  ["Levanto Mis Manos", "Samuel Hernández", "E", 84, 356, ["Júbilo", "Gratitud"]],
  ["Correré", "Miel San Marcos", "A", 138, 312, ["Júbilo"]],
  ["Tuyo Es Mi Corazón", "Danilo Montero", "G", 68, 298, ["Entrega"]],
  ["El Río de Dios", "Generación 12", "D", 92, 377, ["Bautismo", "Júbilo"]],
  ["Cordero de Dios", "Cielos Abiertos", "F", 62, 336, ["Comunión", "Adoración"]],
  ["Bendito El Que Viene", "Marcos Brunet", "C", 74, 419, ["Adoración"]],
  ["Mi Refugio", "Lucía Fernández", "Em", 70, 305, ["Sanidad", "Entrega"]],
  ["Hoy Te Doy Gracias", "Cielos Abiertos", "A", 96, 281, ["Gratitud", "Júbilo"]],
];

function songId(i: number): string {
  return `22222222-0000-4000-8000-${String(i + 1).padStart(12, "0")}`;
}

async function run() {
  await AppDataSource.initialize();
  const runner = AppDataSource.createQueryRunner();

  const existing = await runner.query(`SELECT count(*)::int AS count FROM "users"`);
  if (existing[0].count > 0) {
    console.log("[seed] Ya hay datos cargados, no se vuelve a sembrar.");
    await AppDataSource.destroy();
    return;
  }

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  const roleRows: Array<{ id: string; name: string }> = await runner.query(`SELECT id, name FROM "roles"`);
  const roleIdByName = new Map(roleRows.map((r) => [r.name, r.id]));
  const roleIdForDemoRole = (role: DemoUser["role"]): string => {
    const name =
      role === "admin" ? "Admin" : role === "lider" ? "Líder" : "Músico";
    const id = roleIdByName.get(name);
    if (!id) throw new Error(`[seed] No se encontró el rol '${name}' — ¿corriste las migraciones?`);
    return id;
  };

  for (const user of users) {
    await runner.query(
      `INSERT INTO "users" (id, email, password_hash, name, avatar_color, initials)
       VALUES ($1,$2,$3,$4,$5,$6)`,
      [
        user.id,
        user.email,
        passwordHash,
        user.name,
        user.avatarColor,
        user.initials,
      ],
    );
    await runner.query(`INSERT INTO "user_roles" (user_id, role_id) VALUES ($1,$2)`, [
      user.id,
      roleIdForDemoRole(user.role),
    ]);
  }

  const tagRows: Array<{ id: string; valor: string }> = await runner.query(`SELECT id, valor FROM "tags"`);
  const tagIdByValor = new Map(tagRows.map((t) => [t.valor, t.id]));

  for (const [i, [title, artist, key, bpm, duration, tags]] of titles.entries()) {
    const id = songId(i);
    await runner.query(
      `INSERT INTO "songs" (id, title, artist, key, bpm, compas, duration, cover, chordpro)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      [
        id,
        title,
        artist,
        key,
        bpm,
        "4/4",
        duration,
        covers[i % covers.length],
        bodies[i % bodies.length],
      ],
    );
    for (const tag of tags) {
      const tagId = tagIdByValor.get(tag);
      if (tagId) {
        await runner.query(`INSERT INTO "song_tags" (song_id, tag_id) VALUES ($1,$2)`, [id, tagId]);
      }
    }
  }

  console.log(`[seed] ${users.length} integrantes y ${titles.length} canciones cargados.`);
  console.log(`[seed] Contraseña demo para todos los usuarios: "${DEMO_PASSWORD}"`);

  await AppDataSource.destroy();
}

run().catch((err) => {
  console.error("[seed] Falló el seed:", err);
  process.exit(1);
});
