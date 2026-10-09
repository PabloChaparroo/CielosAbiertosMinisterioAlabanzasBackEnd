import {
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
import { Tag } from "../../tags/entities/tag.entity";
import { AudioTrack } from "./audio-track.entity";
import { SongLink } from "./song-link.entity";
import { SongPlayStat } from "./song-play-stat.entity";
import { TipoCancion } from "./tipo-cancion.entity";

@Entity("songs")
export class Song extends BaseAuditEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar" })
  title!: string;

  @Column({ type: "varchar" })
  artist!: string;

  /** Tonalidad original, ej. "G", "Bm" */
  @Column({ type: "varchar" })
  key!: string;

  @Column({ type: "int" })
  bpm!: number;

  /** Compás musical, ej. "3/4", "4/4" o "6/8" */
  @Column({ type: "varchar", default: "4/4" })
  compas!: string;

  /** Duración en segundos */
  @Column({ type: "int" })
  duration!: number;

  /** Gradiente CSS usado como portada mientras no hay imagen real */
  @Column({ type: "varchar" })
  cover!: string;

  /** Key del objeto en el bucket S3/MinIO (no la URL firmada, que expira) */
  @Column({ type: "varchar", nullable: true })
  audioKey!: string | null;

  /** Nombre propio del audio principal (ej. "Audio Quién podrá"); null = el título de la canción */
  @Column({ type: "varchar", nullable: true })
  audioName!: string | null;

  /** Desde cuándo está marcada como "próxima a sacar"; null = no marcada */
  @Column({ type: "timestamptz", nullable: true })
  proximaDesde!: Date | null;

  /**
   * Calculado al leer (no es columna): marcada y todavía no tocada, es decir, sin ninguna lista
   * de canciones con fecha desde la marca que ya haya pasado al historial
   */
  esProxima?: boolean;

  /** Estilo ChordPro: acordes entre [] antes de la sílaba, {sección} entre llaves */
  @Column({ type: "text" })
  chordpro!: string;

  @Column({ type: "varchar", nullable: true })
  lyricsImageKey!: string | null;

  /** Tipo (Alabanza / Adoración), obligatorio; se devuelve siempre con la canción */
  @ManyToOne(() => TipoCancion, { eager: true, nullable: false })
  @JoinColumn({ name: "tipo_id" })
  tipo!: Relation<TipoCancion>;

  @Column({ type: "uuid" })
  tipoId!: string;

  /** Portada real (key de la imagen en el bucket, carpeta "portadas"). null = se usa `cover` */
  @Column({ type: "varchar", nullable: true })
  coverKey!: string | null;

  @ManyToMany(() => Tag)
  @JoinTable({
    name: "song_tags",
    joinColumn: { name: "song_id" },
    inverseJoinColumn: { name: "tag_id" },
  })
  tags!: Relation<Tag>[];

  @OneToMany(() => SongPlayStat, (stat) => stat.song)
  playStats!: Relation<SongPlayStat>[];

  /** Pistas adicionales (click, guía, solo de instrumento, etc.). No confundir con audioKey (audio original/cover). */
  @OneToMany(() => AudioTrack, (track) => track.song)
  tracks!: Relation<AudioTrack>[];

  /** Cantidad de pistas (secuencia / multitracks); no es columna, la calculan findAll/findById */
  trackCount?: number;

  @OneToMany(() => SongLink, (link) => link.song)
  links!: Relation<SongLink>[];
}
