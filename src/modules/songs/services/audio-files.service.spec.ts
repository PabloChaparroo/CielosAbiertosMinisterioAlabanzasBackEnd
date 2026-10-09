import { NotFoundException } from "@nestjs/common";
import { Repository } from "typeorm";
import { describe, expect, it, vi } from "vitest";
import { StorageService } from "../../../common/storage/storage.service";
import { AudioTrack } from "../entities/audio-track.entity";
import { Song } from "../entities/song.entity";
import { AudioFilesService } from "./audio-files.service";

function setup({
  song = { id: "s1", audioKey: "audios/a.mp3" } as Partial<Song> | null,
  usedBySong = false,
  usedByTrack = false,
} = {}) {
  const songRepo = {
    findOne: vi.fn().mockResolvedValue(song),
    update: vi.fn().mockResolvedValue(undefined),
    exists: vi.fn().mockResolvedValue(usedBySong),
  };
  const audioTrackRepo = { exists: vi.fn().mockResolvedValue(usedByTrack) };
  const storage = { deleteObjects: vi.fn().mockResolvedValue(undefined) };
  const service = new AudioFilesService(
    songRepo as unknown as Repository<Song>,
    audioTrackRepo as unknown as Repository<AudioTrack>,
    storage as unknown as StorageService,
  );
  return { service, songRepo, storage };
}

describe("AudioFilesService — borrar audios con su archivo", () => {
  it("saca el audio principal y borra el archivo si nadie más lo usa", async () => {
    const { service, songRepo, storage } = setup();
    await service.removeSongAudio("s1");
    expect(songRepo.update).toHaveBeenCalledWith("s1", { audioKey: null });
    expect(storage.deleteObjects).toHaveBeenCalledWith(["audios/a.mp3"]);
  });

  it("no borra el archivo si una pista lo sigue usando (audio principal = pista)", async () => {
    const { service, songRepo, storage } = setup({ usedByTrack: true });
    await service.removeSongAudio("s1");
    expect(songRepo.update).toHaveBeenCalled();
    expect(storage.deleteObjects).not.toHaveBeenCalled();
  });

  it("no borra el archivo de una pista si es el audio principal de una canción", async () => {
    const { service, storage } = setup({ usedBySong: true });
    await service.deleteIfUnused("audios/a.mp3");
    expect(storage.deleteObjects).not.toHaveBeenCalled();
  });

  it("canción sin audio: no hace nada; canción inexistente: 404", async () => {
    const sinAudio = setup({ song: { id: "s1", audioKey: null } });
    await sinAudio.service.removeSongAudio("s1");
    expect(sinAudio.songRepo.update).not.toHaveBeenCalled();
    await expect(setup({ song: null }).service.removeSongAudio("x")).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
