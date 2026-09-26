import { Repository } from "typeorm";
import { describe, expect, it, vi } from "vitest";
import { AuthorizationService } from "./authorization.service";
import { PERMISSION_CATALOG, crudPermission } from "./permission.catalog";
import { RolePermission } from "./role-permission.entity";

function setup({
  guestRole = true,
  rolePermissions = [] as string[],
  userRows = [] as string[],
} = {}) {
  const queryBuilder = {
    innerJoin: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    getRawMany: vi.fn().mockResolvedValue(userRows.map((permission) => ({ permission }))),
  };
  const repo = {
    manager: { query: vi.fn().mockResolvedValue(guestRole ? [{ id: "rol-invitado" }] : []) },
    find: vi.fn().mockResolvedValue(rolePermissions.map((permission) => ({ permission }))),
    createQueryBuilder: vi.fn().mockReturnValue(queryBuilder),
  };
  const service = new AuthorizationService(repo as unknown as Repository<RolePermission>);
  return { service, repo, queryBuilder };
}

describe("catálogo de permisos", () => {
  it("son 8 recursos × 4 acciones = 32 permisos, sin repetidos", () => {
    expect(PERMISSION_CATALOG).toHaveLength(32);
    expect(new Set(PERMISSION_CATALOG).size).toBe(32);
  });

  it("formato recurso:acción, incluida la distinción propia/todas de anotaciones", () => {
    expect(crudPermission("anotacion-propia", "update")).toBe("anotacion-propia:update");
    expect(PERMISSION_CATALOG).toContain("anotacion:update");
    expect(PERMISSION_CATALOG).toContain("anotacion-propia:update");
  });
});

describe("AuthorizationService", () => {
  describe("permisos de un usuario", () => {
    it("devuelve los permisos que resuelve la base para ese usuario", async () => {
      const { service, queryBuilder } = setup({ userRows: ["cancion:read", "setlist:read"] });
      await expect(service.getPermissionsForUser("u1")).resolves.toEqual([
        "cancion:read",
        "setlist:read",
      ]);
      // unión de todos sus roles sin repetidos: filtra por el usuario y usa DISTINCT
      expect(queryBuilder.where).toHaveBeenCalledWith("ur.user_id = :userId", { userId: "u1" });
      expect(queryBuilder.select).toHaveBeenCalledWith("DISTINCT rp.permission", "permission");
    });
  });

  describe("permisos del invitado", () => {
    it("solo valen los de lectura, aunque el rol Invitado tenga tildado crear/editar/borrar", async () => {
      const { service } = setup({
        rolePermissions: ["cancion:read", "cancion:delete", "setlist:read", "setlist:write"],
      });
      await expect(service.getGuestPermissions()).resolves.toEqual(["cancion:read", "setlist:read"]);
    });

    it("si el rol Invitado no existe (se borró), el acceso de invitados está deshabilitado → null", async () => {
      const { service, repo } = setup({ guestRole: false });
      await expect(service.getGuestPermissions()).resolves.toBeNull();
      expect(repo.find).not.toHaveBeenCalled();
    });

    it("un rol Invitado sin permisos → lista vacía (habilitado, pero no ve nada)", async () => {
      const { service } = setup({ rolePermissions: [] });
      await expect(service.getGuestPermissions()).resolves.toEqual([]);
    });
  });

  describe("hasAny", () => {
    const { service } = setup();

    it("alcanza con tener uno de los requeridos (OR)", () => {
      expect(service.hasAny(["anotacion-propia:update"], ["anotacion:update", "anotacion-propia:update"])).toBe(true);
    });

    it("false si no tiene ninguno", () => {
      expect(service.hasAny(["cancion:read"], ["cancion:write"])).toBe(false);
    });

    it("sin permisos requeridos → true", () => {
      expect(service.hasAny([], [])).toBe(true);
    });
  });
});
