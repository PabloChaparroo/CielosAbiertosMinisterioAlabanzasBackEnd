import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from "@nestjs/common";
import { crudPermission } from "../../../common/authorization/permission.catalog";
import { Permissions } from "../../../common/decorators/permissions.decorator";
import { CreateSetlistDto, UpdateSetlistDto } from "../dto/setlist.dto";
import { SetlistsService } from "../services/setlists.service";
import { withPublicTeam } from "../public-team";

@Controller("setlists")
export class SetlistsController {
  constructor(private readonly setlistsService: SetlistsService) {}

  @Get()
  @Permissions(crudPermission("setlist", "read"))
  async findAll() {
    return (await this.setlistsService.findAll()).map(withPublicTeam);
  }

  @Get(":id")
  @Permissions(crudPermission("setlist", "read"))
  async findOne(@Param("id", ParseUUIDPipe) id: string) {
    return withPublicTeam(await this.setlistsService.findById(id));
  }

  @Post()
  @Permissions(crudPermission("setlist", "write"))
  async create(@Body() dto: CreateSetlistDto) {
    return withPublicTeam(await this.setlistsService.create(dto));
  }

  @Patch(":id")
  @Permissions(crudPermission("setlist", "update"))
  async update(@Param("id", ParseUUIDPipe) id: string, @Body() dto: UpdateSetlistDto) {
    return withPublicTeam(await this.setlistsService.update(id, dto));
  }

  @Delete(":id")
  @Permissions(crudPermission("setlist", "delete"))
  remove(@Param("id", ParseUUIDPipe) id: string) {
    return this.setlistsService.remove(id);
  }
}
