import { BadRequestException } from "@nestjs/common";
import { Repository } from "typeorm";
import { describe, expect, it, vi } from "vitest";
import { RolePermission } from "../../../common/authorization/role-permission.entity";
import { User } from "../../users/entities/user.entity";
import { Role } from "../entities/role.entity";
import { RolesService } from "./roles.service";

function setup(roleName: string) {
  const role = { id: "r1", name: roleName } as Role;
  const user = { id: "u1", roles: [] as Role[] } as User;
  const roleRepo = {
    findOne: vi.fn().mockResolvedValue(role),
    save: vi.fn().mockImplementation(async (r: Role) => r),
  };
  const userRepo = {
    findOne: vi.fn().mockResolvedValue(user),
    save: vi.fn().mockImplementation(async (u: User) => u),
  };
  const service = new RolesService(
    roleRepo as unknown as Repository<Role>,
    {} as Repository<RolePermission>,
    userRepo as unknown as Repository<User>,
  );
  return { service, roleRepo, userRepo };
}

describe("RolesService — el rol Invitado es especial", () => {
  it("no se puede asignar a un integrante (es para el acceso sin cuenta)", async () => {
    const { service, userRepo } = setup("Invitado");
    await expect(service.assignToUser("u1", "r1")).rejects.toThrow(BadRequestException);
    expect(userRepo.save).not.toHaveBeenCalled();
  });

  it("no se puede renombrar (el acceso de invitados lo busca por nombre)", async () => {
    const { service, roleRepo } = setup("Invitado");
    await expect(service.rename("r1", { name: "Visitas" })).rejects.toThrow(BadRequestException);
    expect(roleRepo.save).not.toHaveBeenCalled();
  });

  it("los demás roles sí se asignan", async () => {
    const { service, userRepo } = setup("Músico");
    const roles = await service.assignToUser("u1", "r1");
    expect(roles.map((r) => r.name)).toEqual(["Músico"]);
    expect(userRepo.save).toHaveBeenCalled();
  });

  it("los demás roles sí se renombran", async () => {
    const { service, roleRepo } = setup("Músico");
    roleRepo.findOne.mockResolvedValueOnce({ id: "r1", name: "Músico" }).mockResolvedValueOnce(null);
    const renamed = await service.rename("r1", { name: "Instrumentista" });
    expect(renamed.name).toBe("Instrumentista");
  });
});
