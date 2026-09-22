import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Relation,
} from "typeorm";
import { Song } from "../../songs/entities/song.entity";
import { Setlist } from "./setlist.entity";

@Entity("setlist_items")
export class SetlistItem {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @ManyToOne(() => Setlist, (setlist) => setlist.items, { onDelete: "CASCADE" })
  @JoinColumn({ name: "setlist_id" })
  setlist!: Relation<Setlist>;

  @ManyToOne(() => Song, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "song_id" })
  song!: Relation<Song>;

  /** Tonalidad elegida para este evento, puede diferir de la tonalidad original de la canción */
  @Column({ type: "varchar" })
  key!: string;

  @Column({ type: "text", nullable: true })
  note!: string | null;

  /** Orden dentro del setlist */
  @Column({ type: "int" })
  position!: number;
}
