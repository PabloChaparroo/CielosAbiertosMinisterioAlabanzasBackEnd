import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { AuthorizationService } from "../../common/authorization/authorization.service";
import { GUEST_ROLE_NAME, GUEST_SUBJECT } from "../../common/authorization/guest";
import { UsersService } from "../users/services/users.service";
import { ChangeMyPasswordDto } from "./dto/change-my-password.dto";
import { LoginDto } from "./dto/login.dto";
import { UpdateMyProfileDto } from "./dto/update-my-profile.dto";

const SALT_ROUNDS = 10;

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

    const permissions = await this.authorizationService.getPermissionsForUser(user.id);

    const accessToken = await this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
      permissions,
    });

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        roles: user.roles.map((r) => r.name),
        permissions,
      },
    };
  }

  /**
   * Sesión de invitado: sin usuario ni contraseña, no crea nada en la base. El token solo dice
   * `guest: true`; los permisos se leen en cada pedido del rol "Invitado" (solo lectura).
   * Ver common/authorization/guest.ts.
   */
  async loginAsGuest() {
    if (!(await this.authorizationService.getGuestPermissions())) {
      throw new ForbiddenException("El acceso de invitados no está habilitado");
    }
    const accessToken = await this.jwtService.signAsync({ sub: GUEST_SUBJECT, guest: true });
    return { accessToken };
  }

  /** Mismo shape que me(), para una sesión de invitado */
  async meGuest() {
    return {
      id: GUEST_SUBJECT,
      email: "",
      name: "Invitado",
      roles: [GUEST_ROLE_NAME],
      avatarColor: "linear-gradient(135deg,#64748b,#94a3b8)",
      initials: "IN",
      avatarKey: null,
      permissions: (await this.authorizationService.getGuestPermissions()) ?? [],
      isGuest: true,
    };
  }

  async me(userId: string) {
    const user = await this.usersService.findById(userId);
    const permissions = await this.authorizationService.getPermissionsForUser(user.id);
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      roles: user.roles.map((r) => r.name),
      avatarColor: user.avatarColor,
      initials: user.initials,
      avatarKey: user.avatarKey,
      permissions,
      isGuest: false,
    };
  }

  /**
   * "Mi perfil" — sin ningún permiso de admin, solo requiere estar
   * autenticado. Nunca puede tocar email/roles porque UpdateMyProfileDto
   * no tiene esos campos. Devuelve el mismo shape que me() para que el
   * frontend pueda actualizar su estado local sin un GET extra.
   */
  async updateMyProfile(userId: string, dto: UpdateMyProfileDto) {
    await this.usersService.updateOwnProfile(userId, dto);
    return this.me(userId);
  }

  /**
   * Requiere la contraseña actual (no alcanza con estar logueado) — mismo
   * bcrypt.compare que ya usa login(), no un mecanismo nuevo.
   */
  async changeMyPassword(userId: string, dto: ChangeMyPasswordDto): Promise<void> {
    const user = await this.usersService.findByIdWithPassword(userId);
    const currentOk = await bcrypt.compare(dto.currentPassword, user.passwordHash);
    if (!currentOk) throw new BadRequestException("La contraseña actual no es correcta");
    const newHash = await bcrypt.hash(dto.newPassword, SALT_ROUNDS);
    await this.usersService.updatePasswordHash(userId, newHash);
  }
}
