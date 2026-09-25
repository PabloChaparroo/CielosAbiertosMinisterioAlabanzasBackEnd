import { describe, expect, it } from "vitest";
import { validateDto } from "../../../common/testing/validate-dto";
import { UpdateRolePermissionsDto } from "./role.dto";

describe("UpdateRolePermissionsDto — permisos de un rol", () => {
  it("acepta permisos del catálogo", async () => {
    const { fields } = await validateDto(UpdateRolePermissionsDto, {
      permissions: ["cancion:read", "anotacion-propia:update"],
    });
    expect(fields).toEqual([]);
  });

  it("acepta una lista vacía (quitarle todos los permisos al rol)", async () => {
    const { fields } = await validateDto(UpdateRolePermissionsDto, { permissions: [] });
    expect(fields).toEqual([]);
  });

  it("rechaza un permiso que no existe en el catálogo", async () => {
    const { fields } = await validateDto(UpdateRolePermissionsDto, {
      permissions: ["cancion:read", "cancion:publicar"],
    });
    expect(fields).toEqual(["permissions"]);
  });

  it("rechaza permisos repetidos", async () => {
    const { fields } = await validateDto(UpdateRolePermissionsDto, {
      permissions: ["cancion:read", "cancion:read"],
    });
    expect(fields).toEqual(["permissions"]);
  });
});
