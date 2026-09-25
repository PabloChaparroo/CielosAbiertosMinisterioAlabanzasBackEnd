import "reflect-metadata";
import { UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { describe, expect, it, vi } from "vitest";
import { AuthorizationService } from "../../../common/authorization/authorization.service";
import { AppConfig } from "../../../config/configuration";
import { UsersService } from "../../users/services/users.service";
import { JwtStrategy } from "./jwt.strategy";

function setup({ active = true, userPermissions = ["cancion:read"], guestPermissions = ["cancion:read"] as string[] | null } = {}) {
  const config = { get: () => ({ secret: "secreto-de-test" }) };
  const users = { isActive: vi.fn().mockResolvedValue(active) };
  const authorization = {
    getPermissionsForUser: vi.fn().mockResolvedValue(userPermissions),
    getGuestPermissions: vi.fn().mockResolvedValue(guestPermissions),
  };
  const strategy = new JwtStrategy(
    config as unknown as ConfigService<AppConfig, true>,
    users as unknown as UsersService,
    authorization as unknown as AuthorizationService,
  );
  return { strategy, users, authorization };
}

describe("JwtStrategy.validate", () => {
  it("los permisos salen de la base, no del token (sacarle un permiso a un rol aplica al instante)", async () => {
    const { strategy, authorization } = setup({ userPermissions: ["cancion:read"] });
    const user = await strategy.validate({
      sub: "u1",
      email: "musico@test.org",
      // el token dice que tiene equipo:read (se lo sacaron después de iniciar sesión)
      permissions: ["cancion:read", "equipo:read"],
    });
    expect(user.permissions).toEqual(["cancion:read"]);
    expect(authorization.getPermissionsForUser).toHaveBeenCalledWith("u1");
    expect(user).toMatchObject({ id: "u1", email: "musico@test.org", isGuest: false });
  });

  it("un usuario dado de baja pierde la sesión aunque el token siga vigente → 401", async () => {
    const { strategy, authorization } = setup({ active: false });
    await expect(strategy.validate({ sub: "u1", email: "x@test.org" })).rejects.toThrow(
      UnauthorizedException,
    );
    expect(authorization.getPermissionsForUser).not.toHaveBeenCalled();
  });

  it("un invitado recibe los permisos del rol Invitado, sin buscar un usuario", async () => {
    const { strategy, users } = setup({ guestPermissions: ["cancion:read"] });
    const user = await strategy.validate({ sub: "invitado", guest: true });
    expect(user).toEqual({ id: "invitado", email: "", permissions: ["cancion:read"], isGuest: true });
    expect(users.isActive).not.toHaveBeenCalled();
  });

  it("si se borró el rol Invitado, las sesiones de invitado se cortan → 401", async () => {
    const { strategy } = setup({ guestPermissions: null });
    await expect(strategy.validate({ sub: "invitado", guest: true })).rejects.toThrow(
      "El acceso de invitados no está habilitado",
    );
  });
});
