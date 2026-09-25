import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { GUEST_ROLE_NAME } from "./guest";
import { PermissionName } from "./permission.catalog";
import { RolePermission } from "./role-permission.entity";

@Injectable()
export class AuthorizationService {
  constructor(
    @InjectRepository(RolePermission)
    private readonly rolePermissionRepo: Repository<RolePermission>,
  ) {}

  /**
   * Permisos de un invitado: los del rol "Invitado", filtrados a solo lectura (ver guest.ts).
   * null si el rol no existe — el acceso de invitados está deshabilitado.
   */
  async getGuestPermissions(): Promise<PermissionName[] | null> {
    const role = await this.rolePermissionRepo.manager.query<Array<{ id: string }>>(
      `SELECT id FROM "roles" WHERE "name" = $1`,
      [GUEST_ROLE_NAME],
    );
    if (role.length === 0) return null;
    const rows = await this.rolePermissionRepo.find({ where: { roleId: role[0]!.id } });
    return rows.map((r) => r.permission).filter((p) => p.endsWith(":read"));
  }

  /** Unión de los permisos de TODOS los roles que tenga el usuario, sin duplicados. */
  async getPermissionsForUser(userId: string): Promise<PermissionName[]> {
    const rows = await this.rolePermissionRepo
      .createQueryBuilder("rp")
      .innerJoin("user_roles", "ur", "ur.role_id = rp.role_id")
      .where("ur.user_id = :userId", { userId })
      .select("DISTINCT rp.permission", "permission")
      .getRawMany<{ permission: PermissionName }>();
    return rows.map((r) => r.permission);
  }

  hasAny(userPermissions: PermissionName[], required: PermissionName[]): boolean {
    if (required.length === 0) return true;
    return required.some((p) => userPermissions.includes(p));
  }
}
