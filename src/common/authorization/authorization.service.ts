import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { SystemRole } from "../../modules/users/entities/user.entity";
import { PermissionName } from "./permission.catalog";
import { RolePermission } from "./role-permission.entity";

@Injectable()
export class AuthorizationService {
  constructor(
    @InjectRepository(RolePermission)
    private readonly rolePermissionRepo: Repository<RolePermission>,
  ) {}

  async getPermissionsForRole(role: SystemRole): Promise<PermissionName[]> {
    const rows = await this.rolePermissionRepo.find({ where: { role } });
    return rows.map((r) => r.permission);
  }

  hasAny(userPermissions: PermissionName[], required: PermissionName[]): boolean {
    if (required.length === 0) return true;
    return required.some((p) => userPermissions.includes(p));
  }
}
