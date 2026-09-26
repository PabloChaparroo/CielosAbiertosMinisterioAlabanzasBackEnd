import { NotFoundException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { DataSource } from "typeorm";
import { describe, expect, it, vi } from "vitest";
import type { PermissionName } from "../../../common/authorization/permission.catalog";
import { PERMISSIONS_KEY } from "../../../common/decorators/permissions.decorator";
import { StorageService } from "../../../common/storage/storage.service";
import { SongsController } from "../controllers/songs.controller";
import { SongPurgeService } from "./song-purge.service";

function setup(
  song: Record<string, string | null> | null,
  trackKeys: Array<string | null> = [],
) {
  const queries: string[] = [];
  const manager = {
    query: vi.fn(async (sql: string) => {
      queries.push(sql.replace(/\s+/g, " ").trim());
      if (sql.includes(`FROM "songs"`)) return song ? [song] : [];
      if (sql.includes(`FROM "audio_tracks"`))
        return trackKeys.map((audio_key) => ({ audio_key }));
      if (sql.includes(`DELETE FROM "setlist_items"`)) return [[], 2];
      return [[], 1];
    }),
  };
  const dataSource = {
    transaction: vi.fn(async (fn: (m: typeof manager) => unknown) =>
      fn(manager),
    ),
  };
  const storage = { deleteObjects: vi.fn(async () => undefined) };
  const service = new SongPurgeService(
    dataSource as unknown as DataSource,
    storage as unknown as StorageService,
  );
  return { service, queries, storage };
}

describe("SongPurgeService.purge — eliminar una canción definitivamente", () => {
  it("la saca de los setlists, la borra (el resto va por cascada) y borra sus archivos", async () => {
    const { service, queries, storage } = setup(
      { audio_key: "audios/a", lyrics_image_key: "letras/l", cover_key: null },
      ["audios/t1", "audios/t2", "audios/a"],
    );
    await expect(service.purge("s1")).resolves.toEqual({
      deletedFiles: 4,
      removedFromSetlists: 2,
    });
    expect(
      queries.some((q) => q.startsWith(`DELETE FROM "setlist_items"`)),
    ).toBe(true);
    // primero los setlists (no dejan borrar la canción), después la canción
    const setlists = queries.findIndex((q) =>
      q.startsWith(`DELETE FROM "setlist_items"`),
    );
    const songs = queries.findIndex((q) => q.startsWith(`DELETE FROM "songs"`));
    expect(setlists).toBeLessThan(songs);
    // archivos sin repetir y sin vacíos
    expect(storage.deleteObjects).toHaveBeenCalledWith([
      "audios/a",
      "letras/l",
      "audios/t1",
      "audios/t2",
    ]);
  });

  it("canción inexistente → 404, sin borrar nada ni tocar el bucket", async () => {
    const { service, queries, storage } = setup(null);
    await expect(service.purge("x")).rejects.toThrow(NotFoundException);
    expect(queries.some((q) => q.startsWith("DELETE"))).toBe(false);
    expect(storage.deleteObjects).not.toHaveBeenCalled();
  });

  it("la ruta exige cancion-definitiva:delete (solo Admin), no cancion:delete", () => {
    const permissions = new Reflector().get<PermissionName[]>(
      PERMISSIONS_KEY,
      SongsController.prototype.purge,
    );
    expect(permissions).toEqual(["cancion-definitiva:delete"]);
  });
});
