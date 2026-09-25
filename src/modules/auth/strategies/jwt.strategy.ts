import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { AppConfig } from "../../../config/configuration";
import { AuthorizationService } from "../../../common/authorization/authorization.service";
import { UsersService } from "../../users/services/users.service";
import { AuthenticatedUser } from "../types/authenticated-user";

interface JwtPayload {
  sub: string;
  email: string;
  permissions: AuthenticatedUser["permissions"];
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService<AppConfig, true>,
    private readonly usersService: UsersService,
    private readonly authorizationService: AuthorizationService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get("jwt", { infer: true }).secret,
    });
  }

  /**
   * Los permisos se leen de la base en cada pedido, no del token: el token dura 8h y, si se
   * usaban los que traía, sacarle un permiso a un rol (o dar de baja a alguien) no tenía efecto
   * hasta que esa persona volviera a iniciar sesión. Ver docs/estado-actual.md.
   */
  async validate(payload: JwtPayload): Promise<AuthenticatedUser> {
    if (!(await this.usersService.isActive(payload.sub))) {
      throw new UnauthorizedException("La cuenta ya no está activa");
    }
    return {
      id: payload.sub,
      email: payload.email,
      permissions: await this.authorizationService.getPermissionsForUser(payload.sub),
    };
  }
}
