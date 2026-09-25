import { Controller, Delete, Param, ParseUUIDPipe, Post } from "@nestjs/common";
import { crudPermission } from "../../../common/authorization/permission.catalog";
import { Permissions } from "../../../common/decorators/permissions.decorator";
import { RolesService } from "../services/roles.service";

/**
 * Asignar/quitar un rol a un usuario se gobierna con permisos de "rol" (no
 * "equipo"): es administración de accesos, una capacidad más sensible que
 * editar el perfil de un integrante (nombre, ministryRole, etc.).
 */
@Controller("equipo/:userId/roles")
export class UserRolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post(":roleId")
  @Permissions(crudPermission("rol", "write"))
  assign(
    @Param("userId", ParseUUIDPipe) userId: string,
    @Param("roleId", ParseUUIDPipe) roleId: string,
  ) {
    return this.rolesService.assignToUser(userId, roleId);
  }

  @Delete(":roleId")
  @Permissions(crudPermission("rol", "delete"))
  remove(
    @Param("userId", ParseUUIDPipe) userId: string,
    @Param("roleId", ParseUUIDPipe) roleId: string,
  ) {
    return this.rolesService.removeFromUser(userId, roleId);
  }
}
