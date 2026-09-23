import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { PermissionName } from "./permission.catalog";
import { RolePermission } from "./role-permission.entity";

@Injectable()
export class AuthorizationService {
  constructor(
    @InjectRepository(RolePermission)
    private readonly rolePermissionRepo: Repository<RolePermission>,
  ) {}

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
