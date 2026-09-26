import { describe, expect, it } from "vitest";
import { validateDto } from "../../../common/testing/validate-dto";
import { CreateSongDto, UpdateSongDto } from "./song.dto";

const valid = {
  title: "Océanos",
  artist: "Hillsong",
  key: "D",
  bpm: 64,
  compas: "4/4",
  duration: 540,
  cover: "linear-gradient(135deg,#000,#fff)",
  chordpro: "[D]Tu voz",
  tags: ["Adoración"],
  tipoId: "11111111-1111-4111-8111-111111111111",
};

describe("CreateSongDto — tipo de canción obligatorio", () => {
  it("acepta una canción con tipo", async () => {
    expect((await validateDto(CreateSongDto, valid)).fields).toEqual([]);
  });

  it("sin tipo → rechazada", async () => {
    const { tipoId: _, ...sinTipo } = valid;
    expect((await validateDto(CreateSongDto, sinTipo)).fields).toContain("tipoId");
  });

  it("un tipo que no es un id válido → rechazado", async () => {
    expect((await validateDto(CreateSongDto, { ...valid, tipoId: "Alabanza" })).fields).toContain(
      "tipoId",
    );
  });

  it("al editar el tipo es opcional (si no viene, no se toca)", async () => {
    expect((await validateDto(UpdateSongDto, { title: "Otro" })).fields).toEqual([]);
  });
});
