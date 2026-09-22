import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { In, Repository } from "typeorm";
import { User } from "../../users/entities/user.entity";
import { CreateSetlistDto, UpdateSetlistDto } from "../dto/setlist.dto";
import { SetlistItem } from "../entities/setlist-item.entity";
import { Setlist } from "../entities/setlist.entity";

@Injectable()
export class SetlistsService {
  constructor(
    @InjectRepository(Setlist)
    private readonly setlistRepo: Repository<Setlist>,
    @InjectRepository(SetlistItem)
    private readonly setlistItemRepo: Repository<SetlistItem>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  findAll(): Promise<Setlist[]> {
    return this.setlistRepo.find({
      relations: { leader: true, team: true, items: { song: true } },
      order: { date: "DESC" },
    });
  }

  async findById(id: string): Promise<Setlist> {
    const setlist = await this.setlistRepo.findOne({
      where: { id },
      relations: { leader: true, team: true, items: { song: true } },
    });
    if (!setlist) throw new NotFoundException("Setlist no encontrado");
    return setlist;
  }

  private async resolveTeam(teamIds: string[]): Promise<User[]> {
    if (teamIds.length === 0) return [];
    return this.userRepo.find({ where: { id: In(teamIds) } });
  }

  async create(dto: CreateSetlistDto): Promise<Setlist> {
    const leader = await this.userRepo.findOneOrFail({ where: { id: dto.leaderId } });
    const team = await this.resolveTeam(dto.teamIds);

    const setlist = this.setlistRepo.create({
      title: dto.title,
      date: new Date(dto.date),
      type: dto.type,
      leader,
      team,
      items: dto.items.map((item, index) =>
        this.setlistItemRepo.create({
          song: { id: item.songId } as never,
          key: item.key,
          note: item.note ?? null,
          position: index,
        }),
      ),
    });
    return this.setlistRepo.save(setlist);
  }

  async update(id: string, dto: UpdateSetlistDto): Promise<Setlist> {
    const setlist = await this.findById(id);

    if (dto.leaderId) {
      setlist.leader = await this.userRepo.findOneOrFail({ where: { id: dto.leaderId } });
    }
    if (dto.teamIds) {
      setlist.team = await this.resolveTeam(dto.teamIds);
    }
    if (dto.items) {
      await this.setlistItemRepo.delete({ setlist: { id } });
      setlist.items = dto.items.map((item, index) =>
        this.setlistItemRepo.create({
          setlist,
          song: { id: item.songId } as never,
          key: item.key,
          note: item.note ?? null,
          position: index,
        }),
      );
    }
    Object.assign(setlist, {
      ...(dto.title !== undefined && { title: dto.title }),
      ...(dto.date !== undefined && { date: new Date(dto.date) }),
      ...(dto.type !== undefined && { type: dto.type }),
    });
    return this.setlistRepo.save(setlist);
  }

  async remove(id: string): Promise<void> {
    const setlist = await this.findById(id);
    await this.setlistRepo.softRemove(setlist);
  }
}
