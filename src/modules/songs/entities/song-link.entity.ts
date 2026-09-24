import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Relation } from "typeorm";
import { Song } from "./song.entity";

@Entity("song_links")
export class SongLink {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar" })
  label!: string;

  @Column({ type: "varchar" })
  url!: string;

  @Column({ type: "varchar", nullable: true })
  type!: string | null;

  @Column({ type: "int", default: 0 })
  order!: number;

  @ManyToOne(() => Song, (song) => song.links, { onDelete: "CASCADE" })
  @JoinColumn({ name: "song_id" })
  song!: Relation<Song>;
}
