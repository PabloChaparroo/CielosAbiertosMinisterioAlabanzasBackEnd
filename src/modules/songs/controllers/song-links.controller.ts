import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post } from "@nestjs/common";
import { crudPermission } from "../../../common/authorization/permission.catalog";
import { Permissions } from "../../../common/decorators/permissions.decorator";
import { CreateSongLinkDto, UpdateSongLinkDto } from "../dto/song-link.dto";
import { SongLinksService } from "../services/song-links.service";

@Controller("canciones/:songId/links")
export class SongLinksBySongController {
  constructor(private readonly songLinksService: SongLinksService) {}

  @Get()
  @Permissions(crudPermission("cancion", "read"))
  findBySong(@Param("songId", ParseUUIDPipe) songId: string) {
    return this.songLinksService.findBySong(songId);
  }

  @Post()
  @Permissions(crudPermission("cancion", "write"))
  create(@Param("songId", ParseUUIDPipe) songId: string, @Body() dto: CreateSongLinkDto) {
    return this.songLinksService.create(songId, dto);
  }
}

@Controller("links")
export class SongLinksController {
  constructor(private readonly songLinksService: SongLinksService) {}

  @Patch(":id")
  @Permissions(crudPermission("cancion", "update"))
  update(@Param("id", ParseUUIDPipe) id: string, @Body() dto: UpdateSongLinkDto) {
    return this.songLinksService.update(id, dto);
  }

  @Delete(":id")
  @Permissions(crudPermission("cancion", "delete"))
  remove(@Param("id", ParseUUIDPipe) id: string) {
    return this.songLinksService.remove(id);
  }
}
