import { PermissionName } from "../../../common/authorization/permission.catalog";
import { SystemRole } from "../../users/entities/user.entity";

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: SystemRole;
  permissions: PermissionName[];
}
