import { Entity, JoinColumn, ManyToOne, PrimaryColumn, Relation } from "typeorm";
import { Role } from "../../modules/roles/entities/role.entity";
import { PermissionName } from "./permission.catalog";

@Entity("role_permissions")
export class RolePermission {
  @PrimaryColumn({ name: "role_id", type: "uuid" })
  roleId!: string;

  @PrimaryColumn({ type: "varchar" })
  permission!: PermissionName;

  @ManyToOne(() => Role, { onDelete: "CASCADE" })
  @JoinColumn({ name: "role_id" })
  role!: Relation<Role>;
}
