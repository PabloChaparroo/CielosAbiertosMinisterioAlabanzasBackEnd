import { BadRequestException } from "@nestjs/common";
import { INSTRUMENTS } from "../users/instruments";

/** Qué toca cada miembro del equipo en una lista de canciones: { [userId]: instrumentos } */
export type TeamInstruments = Record<string, string[]>;

const VALID = new Set<string>(INSTRUMENTS);

/**
 * Deja solo a los miembros que están en el equipo de la lista (si alguien se sacó del equipo, se
 * va también su instrumento), sin repetidos y sin entradas vacías. Un instrumento que no existe
 * es un error (400): no se descarta en silencio.
 */
export function cleanTeamInstruments(value: unknown, teamIds: string[]): TeamInstruments {
  if (value === undefined || value === null) return {};
  if (typeof value !== "object" || Array.isArray(value)) {
    throw new BadRequestException("teamInstruments tiene que ser un objeto { userId: instrumentos }");
  }
  const team = new Set(teamIds);
  const out: TeamInstruments = {};
  for (const [userId, list] of Object.entries(value as Record<string, unknown>)) {
    if (!Array.isArray(list) || list.some((x) => typeof x !== "string")) {
      throw new BadRequestException("Los instrumentos de cada miembro van en una lista");
    }
    const invalid = (list as string[]).find((x) => !VALID.has(x));
    if (invalid) throw new BadRequestException(`Instrumento desconocido: ${invalid}`);
    const unique = [...new Set(list as string[])];
    if (team.has(userId) && unique.length) out[userId] = unique;
  }
  return out;
}
