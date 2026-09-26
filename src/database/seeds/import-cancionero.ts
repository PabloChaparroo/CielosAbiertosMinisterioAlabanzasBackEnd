import "reflect-metadata";
import { AppDataSource } from "../../config/data-source";
import {
  CANCIONERO,
  CANCIONES_DE_PRUEBA,
  type CancioneroSong,
} from "./data/cancionero";

/**
 * Importa el cancionero real de la iglesia (seeds/data/cancionero.ts). Se corre UNA vez, a mano,
 * como admin:create — no forma parte de npm run dev ni del deploy:
 *
 *   npm run songs:import
 *   (contra Neon: con DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME y DB_SSL=true en la terminal)
 *
 * 1. Da de baja (soft delete, como la app) las canciones de prueba: las del seed demo y
 *    "Prueba Multitrack", identificadas por título + artista exactos. Si no hay (ej. en
 *    producción, donde el seed demo nunca corrió), no hace nada.
 * 2. Inserta las canciones del cancionero. Se puede correr de nuevo sin duplicar: una canción
 *    que ya existe (activa, mismo título y artista, sin distinguir mayúsculas) no se toca —
 *    salvo que esté vacía (sin letra), en cuyo caso se completa con los datos del documento.
 *    Una canción real ya cargada a mano con el mismo título y otro artista tampoco se toca:
 *    se avisa, para revisarla a mano.
 *
 * Distinto de seed:run (usuarios y canciones de DEMO): seed:run NUNCA se corre contra producción.
 */

/** Duración por defecto: el documento no la trae (decisión de Pablo; se corrige desde la app) */
const DEFAULT_DURATION_SECONDS = 240;

/** Mismas portadas (gradientes) que genera la app al dar de alta una canción (UploadModal) */
const COVER_PALETTE = [
  "linear-gradient(135deg,#1e3a8a,#7c3aed)",
  "linear-gradient(135deg,#b45309,#f59e0b)",
  "linear-gradient(135deg,#0f766e,#22d3ee)",
  "linear-gradient(135deg,#831843,#f472b6)",
  "linear-gradient(135deg,#4c1d95,#2563eb)",
  "linear-gradient(135deg,#7c2d12,#ea580c)",
  "linear-gradient(135deg,#064e3b,#84cc16)",
];
function coverFor(title: string): string {
  let hash = 0;
  for (const char of title) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return COVER_PALETTE[hash % COVER_PALETTE.length]!;
}

interface ExistingSong {
  id: string;
  title: string;
  artist: string;
  chordpro: string;
}

async function main() {
  const opts = AppDataSource.options as {
    host?: string;
    database?: string;
    ssl?: unknown;
  };
  console.log(
    `[cancionero] base destino: ${opts.host}/${opts.database} (SSL: ${opts.ssl ? "sí" : "no"})`,
  );

  await AppDataSource.initialize();
  const runner = AppDataSource.createQueryRunner();
  await runner.connect();
  await runner.startTransaction();
  try {
    // catálogos: si faltan temas o tipos, las migraciones no se corrieron contra esta base
    const tagRows: Array<{ id: string; valor: string }> = await runner.query(
      `SELECT id, valor FROM "tags"`,
    );
    const tagIdByValor = new Map(tagRows.map((t) => [t.valor, t.id]));
    const tipoRows: Array<{ id: string; nombre: string }> = await runner.query(
      `SELECT id, nombre FROM "tipos_cancion"`,
    );
    const tipoIdByNombre = new Map(tipoRows.map((t) => [t.nombre, t.id]));
    const missingTags = [...new Set(CANCIONERO.flatMap((s) => s.tags))].filter(
      (t) => !tagIdByValor.has(t),
    );
    const missingTipos = [...new Set(CANCIONERO.map((s) => s.tipo))].filter(
      (t) => !tipoIdByNombre.has(t),
    );
    if (missingTags.length || missingTipos.length) {
      throw new Error(
        `Faltan en la base temas [${missingTags.join(", ")}] / tipos [${missingTipos.join(", ")}]: ` +
          "¿corriste las migraciones (npm run migration:run) contra esta base?",
      );
    }

    // 1. baja de las canciones de prueba
    let bajas = 0;
    for (const [title, artist] of CANCIONES_DE_PRUEBA) {
      const result: [unknown[], number] = await runner.query(
        `UPDATE "songs" SET "fecha_hora_baja" = now()
         WHERE "title" = $1 AND "artist" = $2 AND "fecha_hora_baja" IS NULL`,
        [title, artist],
      );
      if (result[1] > 0) {
        bajas += result[1];
        console.log(`[cancionero] baja (prueba): ${title} — ${artist}`);
      }
    }

    // 2. alta de las canciones reales
    const existing: ExistingSong[] = await runner.query(
      `SELECT id, title, artist, chordpro FROM "songs" WHERE "fecha_hora_baja" IS NULL`,
    );
    const norm = (s: string) => s.trim().toLocaleLowerCase("es");
    const docKeys = new Set(
      CANCIONERO.map((s) => `${norm(s.title)}|${norm(s.artist)}`),
    );
    let altas = 0;
    let completadas = 0;
    const salteadas: string[] = [];
    const revisar: string[] = [];

    const setTags = async (songId: string, song: CancioneroSong) => {
      await runner.query(`DELETE FROM "song_tags" WHERE song_id = $1`, [
        songId,
      ]);
      for (const tag of song.tags) {
        await runner.query(
          `INSERT INTO "song_tags" (song_id, tag_id) VALUES ($1, $2)`,
          [songId, tagIdByValor.get(tag)],
        );
      }
    };

    for (const song of CANCIONERO) {
      const sameTitle = existing.filter(
        (e) =>
          norm(e.title) === norm(song.title) &&
          // otra canción del propio documento con el mismo título (ej. "Santo espíritu" de
          // Averly Morillo y "Santo Espíritu" de Christine D'Clario) no es "la misma cargada a mano"
          (norm(e.artist) === norm(song.artist) ||
            !docKeys.has(`${norm(e.title)}|${norm(e.artist)}`)),
      );
      const match = sameTitle.find((e) => norm(e.artist) === norm(song.artist));
      // una canción ya cargada con el mismo título pero otro artista: puede ser la misma
      // (cargada a mano, con otro nombre de artista) o una distinta — no se decide solo
      const candidate =
        match ?? (sameTitle.length === 1 ? sameTitle[0] : undefined);

      if (candidate && candidate.chordpro.trim() === "") {
        await runner.query(
          `UPDATE "songs" SET key = $2, bpm = $3, compas = $4, chordpro = $5, tipo_id = $6
           WHERE id = $1`,
          [
            candidate.id,
            song.key,
            song.bpm,
            song.compas,
            song.chordpro,
            tipoIdByNombre.get(song.tipo),
          ],
        );
        await setTags(candidate.id, song);
        completadas += 1;
        console.log(
          `[cancionero] completada (estaba vacía): ${candidate.title} — ${candidate.artist}`,
        );
        continue;
      }
      if (match) {
        salteadas.push(`${song.title} — ${song.artist}`);
        continue;
      }
      if (sameTitle.length) {
        revisar.push(
          `${song.title}: ya hay ${sameTitle.map((e) => `"${e.title} — ${e.artist}"`).join(", ")}; ` +
            `el documento dice artista "${song.artist}". No se tocó ni se duplicó.`,
        );
        continue;
      }

      const [inserted]: Array<{ id: string }> = await runner.query(
        `INSERT INTO "songs" (title, artist, key, bpm, compas, duration, cover, chordpro, tipo_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id`,
        [
          song.title,
          song.artist,
          song.key,
          song.bpm,
          song.compas,
          DEFAULT_DURATION_SECONDS,
          coverFor(song.title),
          song.chordpro,
          tipoIdByNombre.get(song.tipo),
        ],
      );
      await setTags(inserted!.id, song);
      existing.push({
        id: inserted!.id,
        title: song.title,
        artist: song.artist,
        chordpro: song.chordpro,
      });
      altas += 1;
    }

    await runner.commitTransaction();
    console.log(
      `[cancionero] listo: ${altas} nuevas, ${completadas} completadas, ${salteadas.length} ya estaban, ` +
        `${bajas} canciones de prueba dadas de baja.`,
    );
    if (salteadas.length)
      console.log(
        `[cancionero] ya estaban (no se tocaron): ${salteadas.join("; ")}`,
      );
    for (const line of revisar)
      console.log(`[cancionero] REVISAR A MANO — ${line}`);
  } catch (err) {
    await runner.rollbackTransaction();
    throw err;
  } finally {
    await runner.release();
    await AppDataSource.destroy();
  }
}

main().catch((err: unknown) => {
  console.error(
    "[cancionero] error — no se guardó nada:",
    err instanceof Error ? err.message : err,
  );
  process.exit(1);
});
