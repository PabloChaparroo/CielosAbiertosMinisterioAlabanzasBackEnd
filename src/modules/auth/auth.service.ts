import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { AuthorizationService } from "../../common/authorization/authorization.service";
import { UsersService } from "../users/services/users.service";
import { LoginDto } from "./dto/login.dto";

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly authorizationService: AuthorizationService,
    private readonly jwtService: JwtService,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmailWithPassword(dto.email);
    if (!user) throw new UnauthorizedException("Credenciales inválidas");

    const passwordOk = await bcrypt.compare(dto.password, user.passwordHash);
    if (!passwordOk) throw new UnauthorizedException("Credenciales inválidas");

    const permissions = await this.authorizationService.getPermissionsForRole(user.role);

    const accessToken = await this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
      role: user.role,
      permissions,
    });

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        permissions,
      },
    };
  }

  async me(userId: string) {
    const user = await this.usersService.findById(userId);
    const permissions = await this.authorizationService.getPermissionsForRole(user.role);
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      ministryRole: user.ministryRole,
      instruments: user.instruments,
      avatarColor: user.avatarColor,
      initials: user.initials,
      permissions,
    };
  }
}
