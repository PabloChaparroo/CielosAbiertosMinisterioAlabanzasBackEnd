import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { ALLOW_GUESTS_KEY } from "../decorators/allow-guests.decorator";
import { PERMISSIONS_KEY } from "../decorators/permissions.decorator";
import { IS_PUBLIC_KEY } from "../decorators/public.decorator";
import { AuthenticatedUser } from "../../modules/auth/types/authenticated-user";
import { PermissionName } from "../authorization/permission.catalog";

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const targets = [context.getHandler(), context.getClass()];
    if (this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, targets)) return true;

    const required = this.reflector.getAllAndOverride<PermissionName[]>(PERMISSIONS_KEY, targets);
    const request = context.switchToHttp().getRequest();
    const user = request.user as AuthenticatedUser | undefined;

    if (!required || required.length === 0) {
      // Endpoint "solo con sesión" (favoritos, mi perfil, subir archivos…): necesita un usuario
      // real, salvo que esté marcado con @AllowGuests. Ver common/authorization/guest.ts.
      if (user?.isGuest && !this.reflector.getAllAndOverride<boolean>(ALLOW_GUESTS_KEY, targets)) {
        throw new ForbiddenException("Esta función necesita una cuenta: los invitados no pueden usarla");
      }
      return true;
    }

    if (!user) throw new ForbiddenException("No autenticado");

    const ok = required.some((p) => user.permissions.includes(p));
    if (!ok) {
      throw new ForbiddenException(
        `No tenés permiso para esta acción (requiere: ${required.join(" o ")})`,
      );
    }
    return true;
  }
}
