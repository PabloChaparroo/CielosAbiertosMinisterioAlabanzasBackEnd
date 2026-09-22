import { CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryColumn, Relation } from "typeorm";
import { Song } from "../../songs/entities/song.entity";
import { User } from "../../users/entities/user.entity";

@Entity("favorites")
export class Favorite {
  @PrimaryColumn({ name: "user_id", type: "uuid" })
  userId!: string;

  @PrimaryColumn({ name: "song_id", type: "uuid" })
  songId!: string;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "user_id" })
  user!: Relation<User>;

  @ManyToOne(() => Song, { onDelete: "CASCADE" })
  @JoinColumn({ name: "song_id" })
  song!: Relation<Song>;

  @CreateDateColumn({ name: "fecha_hora_alta", type: "timestamptz" })
  fechaHoraAlta!: Date;
}
