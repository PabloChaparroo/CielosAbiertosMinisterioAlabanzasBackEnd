import { Injectable, NotFoundException } from "@nestjs/common";
import { DataSource } from "typeorm";
import { StorageService } from "../../../common/storage/storage.service";

/**
 * Eliminación DEFINITIVA de una canción (distinta de dar de baja, que la conserva): borra la
 * canción y todo lo que depende de ella — temas, reproducciones, anotaciones, favoritos, pistas,
 * links (por ON DELETE CASCADE) y sus apariciones en setlists (setlist_items no deja borrar la
 * canción, así que se sacan antes) — y después los archivos del bucket (audio, foto de letra,
 * portada subida, audios de las pistas), para liberar espacio. Sirve también para una canción
 * que ya estaba dada de baja.
 */
@Injectable()
export class SongPurgeService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly storageService: StorageService,
  ) {}

  async purge(
    id: string,
  ): Promise<{ deletedFiles: number; removedFromSetlists: number }> {
    const keys: string[] = [];
    let removedFromSetlists = 0;

    await this.dataSource.transaction(async (manager) => {
      const [song]: Array<{
        audio_key: string | null;
        lyrics_image_key: string | null;
        cover_key: string | null;
      }> = await manager.query(
        `SELECT audio_key, lyrics_image_key, cover_key FROM "songs" WHERE id = $1`,
        [id],
      );
      if (!song) throw new NotFoundException("Canción no encontrada");

      const tracks: Array<{ audio_key: string | null }> = await manager.query(
        `SELECT audio_key FROM "audio_tracks" WHERE song_id = $1`,
        [id],
      );
      keys.push(
        ...[
          song.audio_key,
          song.lyrics_image_key,
          song.cover_key,
          ...tracks.map((t) => t.audio_key),
        ].filter((key): key is string => Boolean(key)),
      );

      const [, removed]: [unknown, number] = await manager.query(
        `DELETE FROM "setlist_items" WHERE song_id = $1`,
        [id],
      );
      removedFromSetlists = removed;
      await manager.query(`DELETE FROM "songs" WHERE id = $1`, [id]);
    });

    // los archivos, recién cuando la base ya confirmó el borrado
    const uniqueKeys = [...new Set(keys)];
    await this.storageService.deleteObjects(uniqueKeys);
    return { deletedFiles: uniqueKeys.length, removedFromSetlists };
  }
}
