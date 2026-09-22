import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Relation } from "typeorm";
import { BaseAuditEntity } from "../../../common/entities/base-audit.entity";
import { Song } from "../../songs/entities/song.entity";
import { User } from "../../users/entities/user.entity";

@Entity("annotations")
export class Annotation extends BaseAuditEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @ManyToOne(() => Song, { onDelete: "CASCADE" })
  @JoinColumn({ name: "song_id" })
  song!: Relation<Song>;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "author_id" })
  author!: Relation<User>;

  @Column({ type: "text" })
  text!: string;
}
