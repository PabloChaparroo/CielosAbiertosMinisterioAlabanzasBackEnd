import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { TagsModule } from "../tags/tags.module";
import { SongsController } from "./controllers/songs.controller";
import { SongPlayStat } from "./entities/song-play-stat.entity";
import { Song } from "./entities/song.entity";
import { SongsService } from "./services/songs.service";

@Module({
  imports: [TypeOrmModule.forFeature([Song, SongPlayStat]), TagsModule],
  controllers: [SongsController],
  providers: [SongsService],
  exports: [SongsService],
})
export class SongsModule {}
