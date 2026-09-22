import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { PERMISSIONS_KEY } from "../decorators/permissions.decorator";
import { AuthenticatedUser } from "../../modules/auth/types/authenticated-user";
import { PermissionName } from "../authorization/permission.catalog";

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<PermissionName[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!required || required.length === 0) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user as AuthenticatedUser | undefined;
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
