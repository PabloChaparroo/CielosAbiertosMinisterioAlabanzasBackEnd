import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { StorageService } from "../../../common/storage/storage.service";
import { AudioTrack } from "../entities/audio-track.entity";
import { Song } from "../entities/song.entity";

/**
 * Borrado de audios con su archivo del bucket. Un mismo archivo puede ser el audio principal de
 * la canción y una de sus pistas a la vez ("Usar como principal" copia la key): solo se borra
 * del bucket cuando ya nadie lo usa.
 */
@Injectable()
export class AudioFilesService {
  constructor(
    @InjectRepository(Song)
    private readonly songRepo: Repository<Song>,
    @InjectRepository(AudioTrack)
    private readonly audioTrackRepo: Repository<AudioTrack>,
    private readonly storageService: StorageService,
  ) {}

  /** Saca el audio principal de la canción y borra el archivo si no lo usa una pista */
  async removeSongAudio(songId: string): Promise<void> {
    const song = await this.songRepo.findOne({ where: { id: songId } });
    if (!song) throw new NotFoundException("Canción no encontrada");
    const key = song.audioKey;
    if (!key) return;
    await this.songRepo.update(songId, { audioKey: null });
    await this.deleteIfUnused(key);
  }

  /** Borra el archivo del bucket si ninguna canción (ni dada de baja) ni pista lo usa */
  async deleteIfUnused(key: string): Promise<void> {
    const usedBySong = await this.songRepo.exists({ where: { audioKey: key }, withDeleted: true });
    const usedByTrack = await this.audioTrackRepo.exists({ where: { audioKey: key } });
    if (!usedBySong && !usedByTrack) await this.storageService.deleteObjects([key]);
  }
}
