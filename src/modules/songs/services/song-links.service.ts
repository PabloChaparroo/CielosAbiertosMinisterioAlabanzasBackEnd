import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CreateSongLinkDto, UpdateSongLinkDto } from "../dto/song-link.dto";
import { SongLink } from "../entities/song-link.entity";
import { SongsService } from "./songs.service";

@Injectable()
export class SongLinksService {
  constructor(
    @InjectRepository(SongLink)
    private readonly songLinkRepo: Repository<SongLink>,
    private readonly songsService: SongsService,
  ) {}

  findBySong(songId: string): Promise<SongLink[]> {
    return this.songLinkRepo.find({
      where: { song: { id: songId } },
      order: { order: "ASC" },
    });
  }

  async create(songId: string, dto: CreateSongLinkDto): Promise<SongLink> {
    await this.songsService.findById(songId);
    const link = this.songLinkRepo.create({
      label: dto.label,
      url: dto.url,
      type: dto.type ?? null,
      order: dto.order ?? 0,
      song: { id: songId } as never,
    });
    return this.songLinkRepo.save(link);
  }

  private async findByIdOrFail(id: string): Promise<SongLink> {
    const link = await this.songLinkRepo.findOne({ where: { id } });
    if (!link) throw new NotFoundException("Link no encontrado");
    return link;
  }

  async update(id: string, dto: UpdateSongLinkDto): Promise<SongLink> {
    const link = await this.findByIdOrFail(id);
    Object.assign(link, {
      ...(dto.label !== undefined && { label: dto.label }),
      ...(dto.url !== undefined && { url: dto.url }),
      ...(dto.type !== undefined && { type: dto.type }),
      ...(dto.order !== undefined && { order: dto.order }),
    });
    return this.songLinkRepo.save(link);
  }

  async remove(id: string): Promise<void> {
    const link = await this.findByIdOrFail(id);
    await this.songLinkRepo.remove(link);
  }
}
