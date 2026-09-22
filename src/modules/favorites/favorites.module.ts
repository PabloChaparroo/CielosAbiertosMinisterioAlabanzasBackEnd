import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { FavoritesController } from "./controllers/favorites.controller";
import { Favorite } from "./entities/favorite.entity";
import { FavoritesService } from "./services/favorites.service";

@Module({
  imports: [TypeOrmModule.forFeature([Favorite])],
  controllers: [FavoritesController],
  providers: [FavoritesService],
})
export class FavoritesModule {}
