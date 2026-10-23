import type { User } from "../users/entities/user.entity";

/**
 * Lo que de un integrante se muestra en una lista de canciones: lo que hace falta para ver
 * quién toca (nombre, foto, instrumentos), sin email ni roles. Así quien tiene permiso para ver
 * listas pero no el módulo "Equipo" (ej. los músicos) igual ve al equipo de cada lista.
 */
export interface PublicMember {
  id: string;
  name: string;
  avatarColor: string;
  initials: string;
  avatarKey: string | null;
  instruments: string[];
}

export function toPublicMember(user: User): PublicMember {
  return {
    id: user.id,
    name: user.name,
    avatarColor: user.avatarColor,
    initials: user.initials,
    avatarKey: user.avatarKey ?? null,
    instruments: user.instruments ?? [],
  };
}

/** La lista con su líder y su equipo recortados a PublicMember (el resto no cambia) */
export function withPublicTeam<T extends { leader: User; team: User[] }>(
  setlist: T,
): Omit<T, "leader" | "team"> & { leader: PublicMember; team: PublicMember[] } {
  return {
    ...setlist,
    leader: toPublicMember(setlist.leader),
    team: (setlist.team ?? []).map(toPublicMember),
  };
}
