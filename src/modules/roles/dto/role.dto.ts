import { ArrayUnique, IsArray, IsIn, IsString, MinLength } from "class-validator";
import { PERMISSION_CATALOG, PermissionName } from "../../../common/authorization/permission.catalog";

export class CreateRoleDto {
  @IsString()
  @MinLength(1)
  name!: string;
}

export class RenameRoleDto {
  @IsString()
  @MinLength(1)
  name!: string;
}

export class UpdateRolePermissionsDto {
  /** Reemplaza el set completo de permisos del rol (no incremental). */
  @IsArray()
  @ArrayUnique()
  @IsIn(PERMISSION_CATALOG, { each: true })
  permissions!: PermissionName[];
}
