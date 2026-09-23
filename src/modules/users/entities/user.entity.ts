import { Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn, Relation } from "typeorm";
import { BaseAuditEntity } from "../../../common/entities/base-audit.entity";
import { Role } from "../../roles/entities/role.entity";

@Entity("users")
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
  ministryRole!: string;

  @Column({ type: "text", array: true, default: () => "'{}'" })
  instruments!: string[];

  @Column({ type: "varchar" })
  avatarColor!: string;

  @Column({ type: "varchar", length: 4 })
  initials!: string;

  @ManyToMany(() => Role)
  @JoinTable({
    name: "user_roles",
    joinColumn: { name: "user_id" },
    inverseJoinColumn: { name: "role_id" },
  })
  roles!: Relation<Role>[];
}
