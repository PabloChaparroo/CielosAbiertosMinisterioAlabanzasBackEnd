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
import { CreateRoleDto, RenameRoleDto, UpdateRolePermissionsDto } from "../dto/role.dto";
import { RolesService } from "../services/roles.service";

@Controller("roles")
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  @Permissions(crudPermission("rol", "read"))
  findAll() {
    return this.rolesService.findAllWithPermissionCount();
  }

  @Get(":id/permisos")
  @Permissions(crudPermission("rol", "read"))
  getPermissions(@Param("id", ParseUUIDPipe) id: string) {
    return this.rolesService.getPermissions(id);
  }

  @Post()
  @Permissions(crudPermission("rol", "write"))
  create(@Body() dto: CreateRoleDto) {
    return this.rolesService.create(dto);
  }

  @Patch(":id")
  @Permissions(crudPermission("rol", "update"))
  rename(@Param("id", ParseUUIDPipe) id: string, @Body() dto: RenameRoleDto) {
    return this.rolesService.rename(id, dto);
  }

  @Patch(":id/permisos")
  @Permissions(crudPermission("rol", "update"))
  updatePermissions(@Param("id", ParseUUIDPipe) id: string, @Body() dto: UpdateRolePermissionsDto) {
    return this.rolesService.replacePermissions(id, dto.permissions);
  }

  @Delete(":id")
  @Permissions(crudPermission("rol", "delete"))
  remove(@Param("id", ParseUUIDPipe) id: string) {
    return this.rolesService.remove(id);
  }
}
