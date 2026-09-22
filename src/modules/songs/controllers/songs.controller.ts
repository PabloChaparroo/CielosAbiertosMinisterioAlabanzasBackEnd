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
import { SongsService } from "../services/songs.service";

@Controller("canciones")
export class SongsController {
  constructor(private readonly songsService: SongsService) {}

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
