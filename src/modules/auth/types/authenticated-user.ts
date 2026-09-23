import { PermissionName } from "../../../common/authorization/permission.catalog";

export interface AuthenticatedUser {
  id: string;
  email: string;
  permissions: PermissionName[];
}
