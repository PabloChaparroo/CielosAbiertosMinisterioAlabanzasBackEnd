import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CreateAudioTrackDto, UpdateAudioTrackDto } from "../dto/audio-track.dto";
import { AudioTrack } from "../entities/audio-track.entity";
import { SongsService } from "./songs.service";

@Injectable()
export class AudioTracksService {
  constructor(
    @InjectRepository(AudioTrack)
    private readonly audioTrackRepo: Repository<AudioTrack>,
    private readonly songsService: SongsService,
  ) {}

  findBySong(songId: string): Promise<AudioTrack[]> {
    return this.audioTrackRepo.find({
      where: { song: { id: songId } },
      order: { order: "ASC" },
    });
  }

  async create(songId: string, dto: CreateAudioTrackDto): Promise<AudioTrack> {
    await this.songsService.findById(songId);
    const track = this.audioTrackRepo.create({
      label: dto.label,
      audioKey: dto.audioKey,
      order: dto.order ?? 0,
      song: { id: songId } as never,
    });
    return this.audioTrackRepo.save(track);
  }

  private async findByIdOrFail(id: string): Promise<AudioTrack> {
    const track = await this.audioTrackRepo.findOne({ where: { id } });
    if (!track) throw new NotFoundException("Pista no encontrada");
    return track;
  }

  async update(id: string, dto: UpdateAudioTrackDto): Promise<AudioTrack> {
    const track = await this.findByIdOrFail(id);
    Object.assign(track, {
      ...(dto.label !== undefined && { label: dto.label }),
      ...(dto.audioKey !== undefined && { audioKey: dto.audioKey }),
      ...(dto.order !== undefined && { order: dto.order }),
    });
    return this.audioTrackRepo.save(track);
  }

  async remove(id: string): Promise<void> {
    const track = await this.findByIdOrFail(id);
    await this.audioTrackRepo.remove(track);
  }
}
