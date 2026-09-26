import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { PaginatedResult, PaginationQueryDto } from "../../../common/dto/pagination-query.dto";
import { TagsService } from "../../tags/services/tags.service";
import { CreateSongDto, UpdateSongDto } from "../dto/song.dto";
import { SongPlayStat } from "../entities/song-play-stat.entity";
import { Song } from "../entities/song.entity";
import { TipoCancion } from "../entities/tipo-cancion.entity";

function currentMonthKey(): string {
  return new Date().toISOString().slice(0, 7); // "2026-03"
}

@Injectable()
export class SongsService {
  constructor(
    @InjectRepository(Song)
    private readonly songRepo: Repository<Song>,
    @InjectRepository(SongPlayStat)
    private readonly playStatRepo: Repository<SongPlayStat>,
    private readonly tagsService: TagsService,
    @InjectRepository(TipoCancion)
    private readonly tipoRepo: Repository<TipoCancion>,
  ) {}

  /** 400 si el tipo no existe (en vez de un error de clave foránea de la base) */
  private async assertTipoExists(tipoId: string): Promise<void> {
    if (!(await this.tipoRepo.exists({ where: { id: tipoId } }))) {
      throw new BadRequestException("Tipo de canción inexistente");
    }
  }

  async findAll(query: PaginationQueryDto): Promise<PaginatedResult<Song>> {
    const qb = this.songRepo
      .createQueryBuilder("song")
      .leftJoinAndSelect("song.tags", "tags")
      .leftJoinAndSelect("song.tipo", "tipo")
      .leftJoinAndSelect("song.playStats", "playStats")
      // links: el frontend toma la portada del primer link de YouTube
      .leftJoinAndSelect("song.links", "links")
      // "tiene secuencia": cantidad de pistas, sin traer las pistas
      .loadRelationCountAndMap("song.trackCount", "song.tracks")
      .orderBy("song.fechaHoraAlta", "DESC")
      .addOrderBy("links.order", "ASC");

    if (query.search) {
      qb.andWhere("(song.title ILIKE :search OR song.artist ILIKE :search)", {
        search: `%${query.search}%`,
      });
    }

    const [data, total] = await qb
      .skip((query.page - 1) * query.limit)
      .take(query.limit)
      .getManyAndCount();

    return { data, total, page: query.page, limit: query.limit };
  }

  async findById(id: string): Promise<Song> {
    const song = await this.songRepo
      .createQueryBuilder("song")
      .leftJoinAndSelect("song.tags", "tags")
      .leftJoinAndSelect("song.tipo", "tipo")
      .leftJoinAndSelect("song.playStats", "playStats")
      .leftJoinAndSelect("song.links", "links")
      .loadRelationCountAndMap("song.trackCount", "song.tracks")
      .where("song.id = :id", { id })
      .getOne();
    if (!song) throw new NotFoundException("Canción no encontrada");
    return song;
  }

  async create(dto: CreateSongDto): Promise<Song> {
    await this.assertTipoExists(dto.tipoId);
    const tags = await this.tagsService.findByValues(dto.tags);
    const song = this.songRepo.create({
      tipoId: dto.tipoId,
      title: dto.title,
      artist: dto.artist,
      key: dto.key,
      bpm: dto.bpm,
      duration: dto.duration,
      cover: dto.cover,
      audioKey: dto.audioKey ?? null,
      chordpro: dto.chordpro,
      lyricsImageKey: dto.lyricsImageKey ?? null,
      tags,
    });
    const saved = await this.songRepo.save(song);
    // save() devuelve el mismo objeto que se le pasó, sin autopoblar
    // relaciones que nunca se asignaron (acá, playStats) — se recarga por
    // findById() para que la respuesta de POST tenga el mismo shape que
    // GET /canciones/:id, igual que ya hace update().
    return this.findById(saved.id);
  }

  async update(id: string, dto: UpdateSongDto): Promise<Song> {
    const song = await this.findById(id);
    if (dto.tipoId !== undefined) {
      await this.assertTipoExists(dto.tipoId);
      // la relación eager cargada pisaría tipoId al guardar: se reemplazan las dos
      song.tipo = { id: dto.tipoId } as TipoCancion;
      song.tipoId = dto.tipoId;
    }
    if (dto.tags) song.tags = await this.tagsService.findByValues(dto.tags);
    Object.assign(song, {
      ...(dto.title !== undefined && { title: dto.title }),
      ...(dto.artist !== undefined && { artist: dto.artist }),
      ...(dto.key !== undefined && { key: dto.key }),
      ...(dto.bpm !== undefined && { bpm: dto.bpm }),
      ...(dto.duration !== undefined && { duration: dto.duration }),
      ...(dto.cover !== undefined && { cover: dto.cover }),
      ...(dto.audioKey !== undefined && { audioKey: dto.audioKey }),
      ...(dto.chordpro !== undefined && { chordpro: dto.chordpro }),
      ...(dto.lyricsImageKey !== undefined && { lyricsImageKey: dto.lyricsImageKey }),
      ...(dto.coverKey !== undefined && { coverKey: dto.coverKey }),
    });
    await this.songRepo.save(song);
    // se recarga para devolver el tipo con su nombre (el asignado arriba solo tiene el id)
    return this.findById(id);
  }

  async remove(id: string): Promise<void> {
    const song = await this.findById(id);
    await this.songRepo.softRemove(song);
  }

  /** Incrementa el contador de reproducciones del mes actual (llamado al reproducir una canción). */
  async registerPlay(id: string): Promise<void> {
    await this.findById(id);
    const month = currentMonthKey();
    const existing = await this.playStatRepo.findOne({ where: { songId: id, month } });
    if (existing) {
      existing.plays += 1;
      await this.playStatRepo.save(existing);
    } else {
      await this.playStatRepo.save(this.playStatRepo.create({ songId: id, month, plays: 1 }));
    }
  }
}
