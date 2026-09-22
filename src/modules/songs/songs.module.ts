import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { TagsModule } from "../tags/tags.module";
import { AudioTracksController, SongAudioTracksController } from "./controllers/audio-tracks.controller";
import { SongsController } from "./controllers/songs.controller";
import { AudioTrack } from "./entities/audio-track.entity";
import { SongPlayStat } from "./entities/song-play-stat.entity";
import { Song } from "./entities/song.entity";
import { AudioTracksService } from "./services/audio-tracks.service";
import { SongsService } from "./services/songs.service";

@Module({
  imports: [TypeOrmModule.forFeature([Song, SongPlayStat, AudioTrack]), TagsModule],
  controllers: [SongsController, SongAudioTracksController, AudioTracksController],
  providers: [SongsService, AudioTracksService],
  exports: [SongsService],
})
export class SongsModule {}
