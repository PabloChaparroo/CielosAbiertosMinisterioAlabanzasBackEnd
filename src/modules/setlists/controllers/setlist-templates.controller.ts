import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post } from "@nestjs/common";
import { crudPermission } from "../../../common/authorization/permission.catalog";
import { Permissions } from "../../../common/decorators/permissions.decorator";
import { CreateSetlistTemplateDto, UpdateSetlistTemplateDto } from "../dto/setlist-template.dto";
import { SetlistTemplatesService } from "../services/setlist-templates.service";

/** Listas predefinidas: mismos permisos que los setlists */
@Controller("setlist-templates")
export class SetlistTemplatesController {
  constructor(private readonly service: SetlistTemplatesService) {}

  @Get()
  @Permissions(crudPermission("setlist", "read"))
  findAll() {
    return this.service.findAll();
  }

  @Post()
  @Permissions(crudPermission("setlist", "write"))
  create(@Body() dto: CreateSetlistTemplateDto) {
    return this.service.create(dto);
  }

  @Patch(":id")
  @Permissions(crudPermission("setlist", "update"))
  update(@Param("id", ParseUUIDPipe) id: string, @Body() dto: UpdateSetlistTemplateDto) {
    return this.service.update(id, dto);
  }

  @Delete(":id")
  @Permissions(crudPermission("setlist", "delete"))
  remove(@Param("id", ParseUUIDPipe) id: string) {
    return this.service.remove(id);
  }
}
