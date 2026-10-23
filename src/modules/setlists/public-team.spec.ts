import { describe, expect, it } from "vitest";
import type { User } from "../users/entities/user.entity";
import { withPublicTeam } from "./public-team";

const user = (id: string, name: string): User =>
  ({
    id,
    name,
    email: `${id}@mail.com`,
    avatarColor: "#f90",
    initials: "AB",
    avatarKey: null,
    instruments: ["Voz"],
    roles: [{ id: "r", name: "Músico" }],
  }) as unknown as User;

describe("withPublicTeam — el equipo de una lista sin datos privados", () => {
  const result = withPublicTeam({
    id: "s1",
    title: "Domingo",
    leader: user("l1", "Líder"),
    team: [user("u1", "Josué"), user("u2", "Ale")],
  });

  it("deja nombre, foto e instrumentos de cada integrante", () => {
    expect(result.team[0]).toEqual({
      id: "u1",
      name: "Josué",
      avatarColor: "#f90",
      initials: "AB",
      avatarKey: null,
      instruments: ["Voz"],
    });
    expect(result.team).toHaveLength(2);
  });

  it("no filtra el email ni los roles, ni del equipo ni del líder", () => {
    for (const member of [...result.team, result.leader]) {
      expect(member).not.toHaveProperty("email");
      expect(member).not.toHaveProperty("roles");
    }
  });

  it("el resto de la lista no cambia", () => {
    expect(result.title).toBe("Domingo");
  });
});
