import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from "@nestjs/common";
import { crudPermission } from "../../../common/authorization/permission.catalog";
import { Permissions } from "../../../common/decorators/permissions.decorator";
import { PaginationQueryDto } from "../../../common/dto/pagination-query.dto";
import { CreateSongDto, UpdateSongDto } from "../dto/song.dto";
import { AudioFilesService } from "../services/audio-files.service";
import { SongPurgeService } from "../services/song-purge.service";
import { SongsService } from "../services/songs.service";

@Controller("canciones")
export class SongsController {
  constructor(
    private readonly songsService: SongsService,
    private readonly songPurgeService: SongPurgeService,
    private readonly audioFilesService: AudioFilesService,
  ) {}

  /**
   * Elimina la canción DEFINITIVAMENTE, con todo lo relacionado y sus archivos. Solo con
   * cancion-definitiva:delete (Admin). Distinto de DELETE /canciones/:id (dar de baja).
   */
  @Delete(":id/definitivo")
  @Permissions(crudPermission("cancion-definitiva", "delete"))
  purge(@Param("id", ParseUUIDPipe) id: string) {
    return this.songPurgeService.purge(id);
  }

  /**
   * Saca el audio principal de la canción y borra su archivo del bucket (si ninguna pista lo usa).
   * Mismo permiso que borrar una pista.
   */
  @Delete(":id/audio")
  @Permissions(crudPermission("cancion", "delete"))
  removeAudio(@Param("id", ParseUUIDPipe) id: string) {
    return this.audioFilesService.removeSongAudio(id);
  }

  @Get()
  @Permissions(crudPermission("cancion", "read"))
  findAll(@Query() query: PaginationQueryDto) {
    return this.songsService.findAll(query);
  }

  @Get(":id")
  @Permissions(crudPermission("cancion", "read"))
  findOne(@Param("id", ParseUUIDPipe) id: string) {
    return this.songsService.findById(id);
  }

  @Post()
  @Permissions(crudPermission("cancion", "write"))
  create(@Body() dto: CreateSongDto) {
    return this.songsService.create(dto);
  }

  @Patch(":id")
  @Permissions(crudPermission("cancion", "update"))
  update(@Param("id", ParseUUIDPipe) id: string, @Body() dto: UpdateSongDto) {
    return this.songsService.update(id, dto);
  }

  @Delete(":id")
  @Permissions(crudPermission("cancion", "delete"))
  remove(@Param("id", ParseUUIDPipe) id: string) {
    return this.songsService.remove(id);
  }

  @Post(":id/reproducir")
  @Permissions(crudPermission("cancion", "read"))
  registerPlay(@Param("id", ParseUUIDPipe) id: string) {
    return this.songsService.registerPlay(id);
  }
}
