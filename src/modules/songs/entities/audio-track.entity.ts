import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Relation } from "typeorm";
import { Song } from "./song.entity";

/**
 * Pista adicional de una canción (click, guía, solo de un instrumento, etc.),
 * distinta del audio original/cover que vive en Song.audioKey. El label es
 * texto libre a propósito: no hay un catálogo fijo de tipos de pista.
 */
@Entity("audio_tracks")
export class AudioTrack {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar" })
  label!: string;

  /** Key del objeto en el bucket S3/MinIO, mismo patrón que Song.audioKey */
  @Column({ type: "varchar" })
  audioKey!: string;

  /** Orden de presentación en la lista de pistas de una canción */
  @Column({ type: "int", default: 0 })
  order!: number;

  @ManyToOne(() => Song, (song) => song.tracks, { onDelete: "CASCADE" })
  @JoinColumn({ name: "song_id" })
  song!: Relation<Song>;
}
