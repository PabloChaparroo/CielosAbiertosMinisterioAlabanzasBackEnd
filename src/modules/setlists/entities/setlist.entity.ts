import {
  Check,
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Relation,
} from "typeorm";
import { BaseAuditEntity } from "../../../common/entities/base-audit.entity";
import { User } from "../../users/entities/user.entity";
import { SetlistItem } from "./setlist-item.entity";

export const EVENT_TYPES = ["Culto Domingo", "Ensayo", "Evento Especial"] as const;
export type EventType = (typeof EVENT_TYPES)[number];

@Entity("setlists")
@Check(`"type" IN ('Culto Domingo','Ensayo','Evento Especial')`)
export class Setlist extends BaseAuditEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar" })
  title!: string;

  @Column({ type: "timestamptz" })
  date!: Date;

  @Column({ type: "varchar" })
  type!: EventType;

  @ManyToOne(() => User, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "leader_id" })
  leader!: Relation<User>;

  @OneToMany(() => SetlistItem, (item) => item.setlist, { cascade: true })
  items!: Relation<SetlistItem>[];

  @ManyToMany(() => User)
  @JoinTable({
    name: "setlist_team_members",
    joinColumn: { name: "setlist_id" },
    inverseJoinColumn: { name: "user_id" },
  })
  team!: Relation<User>[];
}
