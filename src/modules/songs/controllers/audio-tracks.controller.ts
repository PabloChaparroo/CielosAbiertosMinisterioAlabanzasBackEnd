import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post } from "@nestjs/common";
import { crudPermission } from "../../../common/authorization/permission.catalog";
import { Permissions } from "../../../common/decorators/permissions.decorator";
import { CreateAudioTrackDto, UpdateAudioTrackDto } from "../dto/audio-track.dto";
import { AudioTracksService } from "../services/audio-tracks.service";

/**
 * Las pistas se gestionan con los permisos de "cancion" (no un recurso propio):
 * no tienen ciclo de vida ni actor independiente de la canción a la que
 * pertenecen, igual que SetlistItem se gestiona con permisos de "setlist".
 */
@Controller("canciones/:songId/pistas")
export class SongAudioTracksController {
  constructor(private readonly audioTracksService: AudioTracksService) {}

  @Get()
  @Permissions(crudPermission("cancion", "read"))
  findBySong(@Param("songId", ParseUUIDPipe) songId: string) {
    return this.audioTracksService.findBySong(songId);
  }

  @Post()
  @Permissions(crudPermission("cancion", "write"))
  create(@Param("songId", ParseUUIDPipe) songId: string, @Body() dto: CreateAudioTrackDto) {
    return this.audioTracksService.create(songId, dto);
  }
}

@Controller("pistas")
export class AudioTracksController {
  constructor(private readonly audioTracksService: AudioTracksService) {}

  @Patch(":id")
  @Permissions(crudPermission("cancion", "update"))
  update(@Param("id", ParseUUIDPipe) id: string, @Body() dto: UpdateAudioTrackDto) {
    return this.audioTracksService.update(id, dto);
  }

  @Delete(":id")
  @Permissions(crudPermission("cancion", "delete"))
  remove(@Param("id", ParseUUIDPipe) id: string) {
    return this.audioTracksService.remove(id);
  }
}
