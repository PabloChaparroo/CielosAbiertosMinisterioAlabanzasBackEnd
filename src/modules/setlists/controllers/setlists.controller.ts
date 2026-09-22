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

@Controller("setlists")
export class SetlistsController {
  constructor(private readonly setlistsService: SetlistsService) {}

  @Get()
  @Permissions(crudPermission("setlist", "read"))
  findAll() {
    return this.setlistsService.findAll();
  }

  @Get(":id")
  @Permissions(crudPermission("setlist", "read"))
  findOne(@Param("id", ParseUUIDPipe) id: string) {
    return this.setlistsService.findById(id);
  }

  @Post()
  @Permissions(crudPermission("setlist", "write"))
  create(@Body() dto: CreateSetlistDto) {
    return this.setlistsService.create(dto);
  }

  @Patch(":id")
  @Permissions(crudPermission("setlist", "update"))
  update(@Param("id", ParseUUIDPipe) id: string, @Body() dto: UpdateSetlistDto) {
    return this.setlistsService.update(id, dto);
  }

  @Delete(":id")
  @Permissions(crudPermission("setlist", "delete"))
  remove(@Param("id", ParseUUIDPipe) id: string) {
    return this.setlistsService.remove(id);
  }
}
