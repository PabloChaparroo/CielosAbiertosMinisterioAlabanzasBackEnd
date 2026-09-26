import { NotFoundException } from "@nestjs/common";
import { Repository } from "typeorm";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TagsService } from "../../tags/services/tags.service";
import { SongPlayStat } from "../entities/song-play-stat.entity";
import { Song } from "../entities/song.entity";
import { SongsService } from "./songs.service";

function setup({ songExists = true, statThisMonth = null as SongPlayStat | null } = {}) {
  const songRepo = { findOne: vi.fn().mockResolvedValue(songExists ? { id: "s1" } : null) };
  const playStatRepo = {
    findOne: vi.fn().mockResolvedValue(statThisMonth),
    save: vi.fn().mockImplementation(async (s: SongPlayStat) => s),
    create: vi.fn().mockImplementation((s: Partial<SongPlayStat>) => s),
  };
  const service = new SongsService(
    songRepo as unknown as Repository<Song>,
    playStatRepo as unknown as Repository<SongPlayStat>,
    {} as TagsService,
  );
  return { service, playStatRepo };
}

describe("SongsService.registerPlay — reproducciones por mes", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("si ya hay registro del mes, suma una reproducción", async () => {
    vi.useFakeTimers({ now: new Date("2026-09-15T12:00:00Z") });
    const stat = { songId: "s1", month: "2026-09", plays: 4 } as SongPlayStat;
    const { service, playStatRepo } = setup({ statThisMonth: stat });
    await service.registerPlay("s1");
    expect(playStatRepo.findOne).toHaveBeenCalledWith({ where: { songId: "s1", month: "2026-09" } });
    expect(playStatRepo.save).toHaveBeenCalledWith(expect.objectContaining({ plays: 5 }));
  });

  it("primera reproducción del mes: crea el registro con 1", async () => {
    vi.useFakeTimers({ now: new Date("2026-09-15T12:00:00Z") });
    const { service, playStatRepo } = setup();
    await service.registerPlay("s1");
    expect(playStatRepo.save).toHaveBeenCalledWith({ songId: "s1", month: "2026-09", plays: 1 });
  });

  it("el mes se calcula en UTC: 30/9 23:30 en Argentina (UTC-3) ya cuenta para octubre", async () => {
    vi.useFakeTimers({ now: new Date("2026-09-30T23:30:00-03:00") });
    const { service, playStatRepo } = setup();
    await service.registerPlay("s1");
    expect(playStatRepo.save).toHaveBeenCalledWith(expect.objectContaining({ month: "2026-10" }));
  });

  it("canción inexistente → 404 sin tocar las estadísticas", async () => {
    const { service, playStatRepo } = setup({ songExists: false });
    await expect(service.registerPlay("nope")).rejects.toThrow(NotFoundException);
    expect(playStatRepo.save).not.toHaveBeenCalled();
  });
});

describe("SongsService.update — portada (coverKey)", () => {
  function setupUpdate(coverKey: string | null) {
    const song = { id: "s1", title: "Océanos", coverKey } as Song;
    const songRepo = {
      findOne: vi.fn().mockResolvedValue(song),
      save: vi.fn().mockImplementation(async (s: Song) => s),
    };
    const service = new SongsService(
      songRepo as unknown as Repository<Song>,
      {} as Repository<SongPlayStat>,
      {} as TagsService,
    );
    return { service };
  }

  it("guarda la key de la portada subida", async () => {
    const { service } = setupUpdate(null);
    await expect(service.update("s1", { coverKey: "portadas/abc" })).resolves.toMatchObject({
      coverKey: "portadas/abc",
    });
  });

  it("null quita la portada (vuelve al gradiente)", async () => {
    const { service } = setupUpdate("portadas/abc");
    await expect(service.update("s1", { coverKey: null })).resolves.toMatchObject({
      coverKey: null,
    });
  });

  it("si no viene coverKey, la portada no se toca", async () => {
    const { service } = setupUpdate("portadas/abc");
    await expect(service.update("s1", { title: "Otro" })).resolves.toMatchObject({
      coverKey: "portadas/abc",
    });
  });
});
