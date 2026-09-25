import { describe, expect, it } from "vitest";
import { validateDto } from "../../../common/testing/validate-dto";
import { CreateSetlistDto } from "./setlist.dto";

const SONG = "22222222-0000-4000-8000-000000000001";
const LEADER = "11111111-0000-4000-8000-000000000002";

const valid = {
  title: "Culto del domingo",
  date: "2026-09-27",
  type: "Culto Domingo",
  leaderId: LEADER,
  items: [{ songId: SONG, key: "G" }],
  teamIds: [LEADER],
};

describe("CreateSetlistDto", () => {
  it("acepta un setlist completo", async () => {
    const { fields } = await validateDto(CreateSetlistDto, valid);
    expect(fields).toEqual([]);
  });

  it("rechaza un setlist sin canciones", async () => {
    const { fields } = await validateDto(CreateSetlistDto, { ...valid, items: [] });
    expect(fields).toEqual(["items"]);
  });

  it("valida cada canción de adentro (no solo que sea una lista)", async () => {
    const { fields } = await validateDto(CreateSetlistDto, {
      ...valid,
      items: [{ songId: SONG, key: "G" }, { songId: "no-es-uuid" }],
    });
    expect(fields).toEqual(["items.1.songId", "items.1.key"]);
  });

  it("rechaza un tipo de evento que no existe", async () => {
    const { fields } = await validateDto(CreateSetlistDto, { ...valid, type: "Cumpleaños" });
    expect(fields).toEqual(["type"]);
  });

  it("rechaza integrantes del equipo que no son un id válido", async () => {
    const { fields } = await validateDto(CreateSetlistDto, { ...valid, teamIds: [LEADER, "juan"] });
    expect(fields).toEqual(["teamIds"]);
  });

  it("rechaza campos desconocidos (igual que la API: forbidNonWhitelisted)", async () => {
    const { fields } = await validateDto(CreateSetlistDto, { ...valid, publicado: true });
    expect(fields).toEqual(["publicado"]);
  });
});
