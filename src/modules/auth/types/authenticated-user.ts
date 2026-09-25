import { PermissionName } from "../../../common/authorization/permission.catalog";

export interface AuthenticatedUser {
  id: string;
  email: string;
  permissions: PermissionName[];
  /** Sesión de invitado (sin fila en users): id = GUEST_SUBJECT. Ver common/authorization/guest.ts */
  isGuest: boolean;
}
