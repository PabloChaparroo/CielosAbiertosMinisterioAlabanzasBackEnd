import "reflect-metadata";
import { readFileSync } from "node:fs";
import { AppDataSource } from "../../config/data-source";
import {
  PUBLICAR_FILE,
  norm,
  parseSolo,
  songKey,
  type CancionAPublicar,
} from "./publicar-canciones.shared";

/**
 * Sube a otra base (ej. Neon) solo las canciones de seeds/data/publicar-canciones.json (armado
 * con songs:export) que se pidan con --solo "Título|Artista". Lo corre Pablo, a mano, como
 * admin:create.
 *
 *   npm run songs:publish -- --solo "..." --solo "..."              → SIMULACIÓN: solo lee y avisa
 *   npm run songs:publish -- --solo "..." --solo "..." --confirmar  → escribe
 *
 * Solo INSERTA (songs, song_tags, song_links), en una transacción. Nunca modifica ni da de baja
 * nada que ya esté. Por cada canción:
 * - ya existe (activa, mismo título + artista, sin distinguir mayúsculas) → no se toca;
 * - hay otra con el mismo título y otro artista → se sube igual, pero se avisa;
 * - si no → se inserta.
 * Cada --solo tiene que estar en el archivo, y el archivo no puede traer canciones sin --solo.
 */
async function main() {
  const argv = process.argv.slice(2);
  const selected = parseSolo(argv);
  const confirmar = argv.includes("--confirmar");

  const songs: CancionAPublicar[] = JSON.parse(readFileSync(PUBLICAR_FILE, "utf8"));
  const selectedKeys = new Set(selected.map((s) => songKey(s.title, s.artist)));
  const fileKeys = new Set(songs.map((s) => songKey(s.title, s.artist)));
  const faltan = selected.filter((s) => !fileKeys.has(songKey(s.title, s.artist)));
  const sobran = songs.filter((s) => !selectedKeys.has(songKey(s.title, s.artist)));
  if (faltan.length || sobran.length || fileKeys.size !== songs.length) {
    throw new Error(
      `el archivo no coincide con los --solo. No están en el archivo: [${faltan.map((s) => `${s.title} — ${s.artist}`).join("; ")}]. ` +
        `Están en el archivo sin --solo: [${sobran.map((s) => `${s.title} — ${s.artist}`).join("; ")}]`,
    );
  }

  const opts = AppDataSource.options as { host?: string; database?: string; ssl?: unknown };
  console.log(
    `[publicar] base destino: ${opts.host}/${opts.database} (SSL: ${opts.ssl ? "sí" : "no"}) — ` +
      (confirmar ? "MODO ESCRITURA" : "SIMULACIÓN (no escribe nada; agregá --confirmar para subir)"),
  );

  await AppDataSource.initialize();
  const runner = AppDataSource.createQueryRunner();
  await runner.connect();
  await runner.startTransaction();
  try {
    const tagRows: Array<{ id: string; valor: string }> = await runner.query(
      `SELECT id, valor FROM "tags"`,
    );
    const tagIdByValor = new Map(tagRows.map((t) => [t.valor, t.id]));
    const tipoRows: Array<{ id: string; nombre: string }> = await runner.query(
      `SELECT id, nombre FROM "tipos_cancion"`,
    );
    const tipoIdByNombre = new Map(tipoRows.map((t) => [t.nombre, t.id]));
    const missingTags = [...new Set(songs.flatMap((s) => s.tags))].filter((t) => !tagIdByValor.has(t));
    const missingTipos = [...new Set(songs.map((s) => s.tipo))].filter((t) => !tipoIdByNombre.has(t));
    if (missingTags.length || missingTipos.length) {
      throw new Error(
        `Faltan en la base temas [${missingTags.join(", ")}] / tipos [${missingTipos.join(", ")}]: ` +
          "¿corriste las migraciones contra esta base?",
      );
    }

    const existing: Array<{ title: string; artist: string }> = await runner.query(
      `SELECT title, artist FROM "songs" WHERE "fecha_hora_baja" IS NULL`,
    );
    console.log(`[publicar] canciones activas en la base destino antes: ${existing.length}`);

    let altas = 0;
    for (const song of songs) {
      const label = `${song.title} — ${song.artist}`;
      if (existing.some((e) => songKey(e.title, e.artist) === songKey(song.title, song.artist))) {
        console.log(`[publicar] YA EXISTE, no se toca: ${label}`);
        continue;
      }
      const sameTitle = existing.filter((e) => norm(e.title) === norm(song.title));
      if (sameTitle.length) {
        console.log(
          `[publicar] AVISO — ${label}: ya hay ${sameTitle.map((e) => `"${e.title} — ${e.artist}"`).join(", ")} ` +
            "(otro artista: se sube como canción distinta)",
        );
      }
      console.log(`[publicar] ${confirmar ? "alta" : "se daría de alta"}: ${label}`);
      altas += 1;
      if (!confirmar) continue;

      const [inserted]: Array<{ id: string }> = await runner.query(
        `INSERT INTO "songs" (title, artist, key, bpm, compas, duration, cover, chordpro, tipo_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id`,
        [song.title, song.artist, song.key, song.bpm, song.compas, song.duration, song.cover,
          song.chordpro, tipoIdByNombre.get(song.tipo)],
      );
      for (const tag of song.tags) {
        await runner.query(`INSERT INTO "song_tags" (song_id, tag_id) VALUES ($1, $2)`, [
          inserted!.id,
          tagIdByValor.get(tag),
        ]);
      }
      for (const link of song.links) {
        await runner.query(
          `INSERT INTO "song_links" (song_id, label, url, type, "order") VALUES ($1, $2, $3, $4, $5)`,
          [inserted!.id, link.label, link.url, link.type, link.order],
        );
      }
      existing.push({ title: song.title, artist: song.artist });
    }

    if (confirmar) await runner.commitTransaction();
    else await runner.rollbackTransaction();
    console.log(
      `[publicar] ${confirmar ? "listo" : "simulación terminada"}: ${altas} ${confirmar ? "nuevas" : "se darían de alta"}, ` +
        `${songs.length - altas} ya estaban. Activas después: ${existing.length + (confirmar ? 0 : altas)}.`,
    );
  } catch (err) {
    await runner.rollbackTransaction();
    throw err;
  } finally {
    await runner.release();
    await AppDataSource.destroy();
  }
}

main().catch((err: unknown) => {
  console.error("[publicar] error — no se guardó nada:", err instanceof Error ? err.message : err);
  process.exit(1);
});
