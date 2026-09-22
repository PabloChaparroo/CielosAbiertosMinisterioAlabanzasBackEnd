import { Controller, Get, Param, ParseUUIDPipe, Post } from "@nestjs/common";
import { CurrentUser } from "../../../common/decorators/current-user.decorator";
import { AuthenticatedUser } from "../../auth/types/authenticated-user";
import { FavoritesService } from "../services/favorites.service";

@Controller("favoritos")
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Get()
  findMine(@CurrentUser() user: AuthenticatedUser) {
    return this.favoritesService.findByUser(user.id);
  }

  @Post(":songId/toggle")
  toggle(@Param("songId", ParseUUIDPipe) songId: string, @CurrentUser() user: AuthenticatedUser) {
    return this.favoritesService.toggle(user.id, songId);
  }
}
