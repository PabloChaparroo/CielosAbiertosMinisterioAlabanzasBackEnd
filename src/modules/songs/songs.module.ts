import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { TagsModule } from "../tags/tags.module";
import { AudioTracksController, SongAudioTracksController } from "./controllers/audio-tracks.controller";
import { SongLinksBySongController, SongLinksController } from "./controllers/song-links.controller";
import { SongsController } from "./controllers/songs.controller";
import { TiposCancionController } from "./controllers/tipos-cancion.controller";
import { AudioTrack } from "./entities/audio-track.entity";
import { SongLink } from "./entities/song-link.entity";
import { SongPlayStat } from "./entities/song-play-stat.entity";
import { Song } from "./entities/song.entity";
import { TipoCancion } from "./entities/tipo-cancion.entity";
import { AudioTracksService } from "./services/audio-tracks.service";
import { SongLinksService } from "./services/song-links.service";
import { SongsService } from "./services/songs.service";

@Module({
  imports: [TypeOrmModule.forFeature([Song, SongPlayStat, AudioTrack, SongLink, TipoCancion]), TagsModule],
  controllers: [
    SongsController,
    SongAudioTracksController,
    AudioTracksController,
    SongLinksBySongController,
    SongLinksController,
    TiposCancionController,
  ],
  providers: [SongsService, AudioTracksService, SongLinksService],
  exports: [SongsService],
})
export class SongsModule {}
