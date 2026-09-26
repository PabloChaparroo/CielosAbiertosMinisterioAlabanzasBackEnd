import "reflect-metadata";
import { writeFileSync } from "node:fs";
import { AppDataSource } from "../../config/data-source";
import {
  PUBLICAR_FILE,
  parseSolo,
  songKey,
  type CancionAPublicar,
} from "./publicar-canciones.shared";

/**
 * Exporta de la base LOCAL solo las canciones pedidas con --solo "Título|Artista" a
 * seeds/data/publicar-canciones.json, para después subirlas con songs:publish. Solo lee.
 *
 *   npm run songs:export -- --solo "Santo Espíritu|Esperanza de vida" --solo "..."
 *
 * Cada --solo tiene que coincidir con exactamente UNA canción activa por título + artista
 * (sin distinguir mayúsculas): "Santo Espíritu — Esperanza de vida" y "Santo espíritu —
 * Averly Morillo" son canciones distintas. Si alguno no coincide, no escribe nada.
 * Se niega a correr con DB_SSL=true (eso es producción, no la base local).
 */
async function main() {
  const selected = parseSolo(process.argv.slice(2));
  if (process.env.DB_SSL === "true") {
    throw new Error("DB_SSL=true: esto parece producción; songs:export es para la base local");
  }
  const opts = AppDataSource.options as { host?: string; database?: string };
  console.log(`[export] base origen: ${opts.host}/${opts.database}`);

  await AppDataSource.initialize();
  try {
    const rows: Array<Omit<CancionAPublicar, "tags" | "links"> & { id: string }> =
      await AppDataSource.query(
        `SELECT s.id, s.title, s.artist, s.key, s.bpm, s.compas, s.duration, s.cover, s.chordpro,
                t.nombre AS tipo
         FROM "songs" s JOIN "tipos_cancion" t ON t.id = s.tipo_id
         WHERE s."fecha_hora_baja" IS NULL`,
      );

    const out: CancionAPublicar[] = [];
    for (const sel of selected) {
      const matches = rows.filter(
        (r) => songKey(r.title, r.artist) === songKey(sel.title, sel.artist),
      );
      if (matches.length !== 1) {
        throw new Error(
          `"${sel.title} — ${sel.artist}": ${matches.length} canciones activas coinciden (tiene que ser 1)`,
        );
      }
      const { id, ...song } = matches[0]!;
      const tags: Array<{ valor: string }> = await AppDataSource.query(
        `SELECT t.valor FROM "song_tags" st JOIN "tags" t ON t.id = st.tag_id
         WHERE st.song_id = $1 ORDER BY t.valor`,
        [id],
      );
      const links: CancionAPublicar["links"] = await AppDataSource.query(
        `SELECT label, url, type, "order" FROM "song_links" WHERE song_id = $1 ORDER BY "order"`,
        [id],
      );
      out.push({ ...song, tags: tags.map((t) => t.valor), links });
      console.log(
        `[export] ${song.title} — ${song.artist} (${song.key} · ${song.compas} · ${song.bpm} BPM, ` +
          `${tags.length} temas, ${links.length} links)`,
      );
    }

    writeFileSync(PUBLICAR_FILE, JSON.stringify(out, null, 2) + "\n", "utf8");
    console.log(`[export] ${out.length} canciones de ${rows.length} activas → ${PUBLICAR_FILE}`);
  } finally {
    await AppDataSource.destroy();
  }
}

main().catch((err: unknown) => {
  console.error("[export] error — no se escribió nada:", err instanceof Error ? err.message : err);
  process.exit(1);
});
