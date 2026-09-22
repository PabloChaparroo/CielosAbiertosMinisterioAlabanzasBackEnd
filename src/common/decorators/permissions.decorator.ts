import { SetMetadata } from "@nestjs/common";
import { PermissionName } from "../authorization/permission.catalog";

export const PERMISSIONS_KEY = "permissions";

/** Requiere que el usuario tenga AL MENOS UNO de los permisos listados. */
export const Permissions = (...permissions: PermissionName[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
