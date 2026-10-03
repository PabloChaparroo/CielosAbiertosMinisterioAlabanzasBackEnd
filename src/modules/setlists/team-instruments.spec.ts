import { BadRequestException } from "@nestjs/common";
import { describe, expect, it } from "vitest";
import { cleanTeamInstruments } from "./team-instruments";

describe("cleanTeamInstruments", () => {
  it("guarda lo que toca cada miembro del equipo", () => {
    expect(
      cleanTeamInstruments({ u1: ["Guitarra eléctrica"], u2: ["Voz", "Teclado"] }, ["u1", "u2"]),
    ).toEqual({ u1: ["Guitarra eléctrica"], u2: ["Voz", "Teclado"] });
  });

  it("descarta a quien no está en el equipo, repetidos y listas vacías", () => {
    expect(
      cleanTeamInstruments({ u1: ["Voz", "Voz"], fuera: ["Bajo"], u2: [] }, ["u1", "u2"]),
    ).toEqual({ u1: ["Voz"] });
  });

  it("sin datos → vacío", () => {
    expect(cleanTeamInstruments(undefined, ["u1"])).toEqual({});
  });

  it("un instrumento que no existe o un formato inválido → 400", () => {
    expect(() => cleanTeamInstruments({ u1: ["Ukelele"] }, ["u1"])).toThrow(BadRequestException);
    expect(() => cleanTeamInstruments({ u1: "Voz" }, ["u1"])).toThrow(BadRequestException);
    expect(() => cleanTeamInstruments(["Voz"], ["u1"])).toThrow(BadRequestException);
  });
});
