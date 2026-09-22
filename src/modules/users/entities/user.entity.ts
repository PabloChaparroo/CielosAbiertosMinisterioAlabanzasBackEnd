import { Check, Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { BaseAuditEntity } from "../../../common/entities/base-audit.entity";

export const SYSTEM_ROLES = ["admin", "lider", "musico"] as const;
export type SystemRole = (typeof SYSTEM_ROLES)[number];

@Entity("users")
@Check(`"role" IN ('admin','lider','musico')`)
export class User extends BaseAuditEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", unique: true })
  email!: string;

  @Column({ type: "varchar", select: false })
  passwordHash!: string;

  @Column({ type: "varchar" })
  name!: string;

  @Column({ type: "varchar" })
  role!: SystemRole;

  @Column({ type: "varchar" })
  ministryRole!: string;

  @Column({ type: "text", array: true, default: () => "'{}'" })
  instruments!: string[];

  @Column({ type: "varchar" })
  avatarColor!: string;

  @Column({ type: "varchar", length: 4 })
  initials!: string;
}
