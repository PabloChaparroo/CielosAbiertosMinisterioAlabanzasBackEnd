import { describe, expect, it } from "vitest";
import { TAG_VALUES } from "../../../modules/tags/entities/tag.entity";
import { CANCIONERO } from "./cancionero";

describe("cancionero (datos de songs:import)", () => {
  it("tiene las 61 canciones del documento, sin repetir título + artista", () => {
    expect(CANCIONERO).toHaveLength(61);
    const keys = CANCIONERO.map((s) => `${s.title.toLowerCase()}|${s.artist.toLowerCase()}`);
    expect(new Set(keys).size).toBe(61);
  });

  it("todos los temas existen en el catálogo", () => {
    const catalog = new Set<string>(TAG_VALUES);
    expect(CANCIONERO.flatMap((s) => s.tags).filter((t) => !catalog.has(t))).toEqual([]);
  });

  it("solo 4 son Alabanza (decisión de Pablo); el resto Adoración", () => {
    expect(CANCIONERO.filter((s) => s.tipo === "Alabanza").map((s) => s.title).sort()).toEqual(
      ["Dios Imparable", "Dios es más grande", "Exaltado estás", "Salmos 108"].sort(),
    );
  });

  it("no queda texto de la IA dirigido al lector", () => {
    const aiPhrases =
      /rellena|busca la letra|busca "|tu documento|tu pdf|en el pdf|según tus notas|tienes anotad|sigue (la|con)|continúa|acomoda|progresión completa|plantilla|letra con acordes/i;
    const offenders = CANCIONERO.flatMap((s) =>
      s.chordpro.split("\n").filter((l) => aiPhrases.test(l)).map((l) => `${s.title}: ${l}`),
    );
    expect(offenders).toEqual([]);
  });

  it("datos obligatorios completos: BPM, compás, tono, artista y letra/acordes", () => {
    for (const s of CANCIONERO) {
      expect(s.bpm, s.title).toBeGreaterThan(0);
      expect(s.compas, s.title).toMatch(/^\d+\/\d+$/);
      expect(s.key, s.title).toMatch(/^[A-G][#b]?m?$/);
      expect(s.artist.trim(), s.title).not.toBe("");
      expect(s.chordpro.trim(), s.title).not.toBe("");
      expect(s.tags.length, s.title).toBeGreaterThan(0);
    }
  });
});
