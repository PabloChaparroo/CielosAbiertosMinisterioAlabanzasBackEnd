import { Column, Entity, Index, ManyToOne, PrimaryColumn, Relation } from "typeorm";
import { Song } from "./song.entity";

/** Un contador de reproducciones por canción y por mes, ej. mes="2026-03" */
@Entity("song_play_stats")
@Index(["song", "month"], { unique: true })
export class SongPlayStat {
  @PrimaryColumn({ name: "song_id", type: "uuid" })
  songId!: string;

  @PrimaryColumn({ type: "varchar", length: 7 })
  month!: string;

  @Column({ type: "int", default: 0 })
  plays!: number;

  @ManyToOne(() => Song, (song) => song.playStats, { onDelete: "CASCADE" })
  song!: Relation<Song>;
}
