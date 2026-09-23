import { Controller, Get } from "@nestjs/common";
import {
  CRUD_ACTIONS,
  CRUD_RESOURCES,
  crudPermission,
  CrudResource,
} from "../../../common/authorization/permission.catalog";
import { Permissions } from "../../../common/decorators/permissions.decorator";

interface PermissionGroup {
  resource: CrudResource;
  permissions: string[];
}

@Controller("permisos")
export class PermissionsController {
  /**
   * Catálogo completo agrupado por recurso. El frontend arma la grilla de
   * checkboxes a partir de esto — nunca hardcodea recursos/acciones, así que
   * agregar un recurso nuevo en el backend se refleja solo, sin tocar la UI.
   */
  @Get()
  @Permissions(crudPermission("rol", "read"))
  findAll(): PermissionGroup[] {
    return CRUD_RESOURCES.map((resource) => ({
      resource,
      permissions: CRUD_ACTIONS.map((action) => crudPermission(resource, action)),
    }));
  }
}
