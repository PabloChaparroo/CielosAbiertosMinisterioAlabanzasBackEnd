import { Body, Controller, Get, HttpCode, Patch, Post } from "@nestjs/common";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { Public } from "../../common/decorators/public.decorator";
import { AuthService } from "./auth.service";
import { ChangeMyPasswordDto } from "./dto/change-my-password.dto";
import { LoginDto } from "./dto/login.dto";
import { UpdateMyProfileDto } from "./dto/update-my-profile.dto";
import { AuthenticatedUser } from "./types/authenticated-user";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post("login")
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Get("me")
  me(@CurrentUser() user: AuthenticatedUser) {
    return this.authService.me(user.id);
  }

  /**
   * "Mi perfil" — sin @Permissions, a propósito: cualquier usuario
   * autenticado edita lo suyo, sin depender de equipo:update (eso sigue
   * siendo exclusivo del ABM de admin en Equipo). Nunca puede tocar a otro
   * usuario porque no toma ningún :id, siempre opera sobre @CurrentUser().
   */
  @Patch("me")
  updateMe(@CurrentUser() user: AuthenticatedUser, @Body() dto: UpdateMyProfileDto) {
    return this.authService.updateMyProfile(user.id, dto);
  }

  @Patch("me/password")
  @HttpCode(204)
  async changeMyPassword(@CurrentUser() user: AuthenticatedUser, @Body() dto: ChangeMyPasswordDto) {
    await this.authService.changeMyPassword(user.id, dto);
  }
}
