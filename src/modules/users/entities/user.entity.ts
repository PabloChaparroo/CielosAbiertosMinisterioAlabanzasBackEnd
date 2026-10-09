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
  avatarColor!: string;

  @Column({ type: "varchar", length: 4 })
  initials!: string;

  /** Instrumentos que toca (ver INSTRUMENTS); puede ser más de uno o ninguno */
  @Column({ type: "text", array: true, default: () => "'{}'" })
  instruments!: string[];

  /** Key del objeto en S3/MinIO de la foto de perfil real, mismo criterio que Song.audioKey/lyricsImageKey. null si el usuario no subió ninguna (sigue mostrándose avatarColor/initials). */
  @Column({ type: "varchar", nullable: true })
  avatarKey!: string | null;

  @ManyToMany(() => Role)
  @JoinTable({
    name: "user_roles",
    joinColumn: { name: "user_id" },
    inverseJoinColumn: { name: "role_id" },
  })
  roles!: Relation<Role>[];

  /** Calculado en GET /equipo (no es columna): tiene un rol con permiso rol:write */
  isAdmin?: boolean;
}
