import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Favorite } from "../entities/favorite.entity";

@Injectable()
export class FavoritesService {
  constructor(
    @InjectRepository(Favorite)
    private readonly favoriteRepo: Repository<Favorite>,
  ) {}

  async findByUser(userId: string): Promise<string[]> {
    const rows = await this.favoriteRepo.find({ where: { userId } });
    return rows.map((r) => r.songId);
  }

  /** Alterna el favorito: lo agrega si no existe, lo saca si ya estaba (igual a toggleFavorite del frontend). */
  async toggle(userId: string, songId: string): Promise<{ isFavorite: boolean }> {
    const existing = await this.favoriteRepo.findOne({ where: { userId, songId } });
    if (existing) {
      await this.favoriteRepo.remove(existing);
      return { isFavorite: false };
    }
    await this.favoriteRepo.save(this.favoriteRepo.create({ userId, songId }));
    return { isFavorite: true };
  }
}
