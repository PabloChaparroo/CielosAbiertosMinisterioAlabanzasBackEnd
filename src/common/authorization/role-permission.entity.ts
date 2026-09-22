import { Entity, PrimaryColumn } from "typeorm";
import { SystemRole } from "../../modules/users/entities/user.entity";
import { PermissionName } from "./permission.catalog";

@Entity("role_permissions")
export class RolePermission {
  @PrimaryColumn({ type: "varchar" })
  role!: SystemRole;

  @PrimaryColumn({ type: "varchar" })
  permission!: PermissionName;
}
