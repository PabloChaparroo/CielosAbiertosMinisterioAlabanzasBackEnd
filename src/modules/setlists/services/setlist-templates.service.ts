import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CreateSetlistTemplateDto, UpdateSetlistTemplateDto } from "../dto/setlist-template.dto";
import { SetlistTemplate } from "../entities/setlist-template.entity";

const toItems = (items: CreateSetlistTemplateDto["items"]) =>
  items.map((it) => ({ songId: it.songId, key: it.key, ...(it.note ? { note: it.note } : {}) }));

@Injectable()
export class SetlistTemplatesService {
  constructor(
    @InjectRepository(SetlistTemplate)
    private readonly repo: Repository<SetlistTemplate>,
  ) {}

  findAll(): Promise<SetlistTemplate[]> {
    return this.repo.find({ order: { title: "ASC" } });
  }

  private async findById(id: string): Promise<SetlistTemplate> {
    const template = await this.repo.findOne({ where: { id } });
    if (!template) throw new NotFoundException("Lista predefinida no encontrada");
    return template;
  }

  create(dto: CreateSetlistTemplateDto): Promise<SetlistTemplate> {
    return this.repo.save(this.repo.create({ title: dto.title.trim(), items: toItems(dto.items) }));
  }

  async update(id: string, dto: UpdateSetlistTemplateDto): Promise<SetlistTemplate> {
    const template = await this.findById(id);
    if (dto.title !== undefined) template.title = dto.title.trim();
    if (dto.items !== undefined) template.items = toItems(dto.items);
    return this.repo.save(template);
  }

  async remove(id: string): Promise<void> {
    await this.findById(id);
    await this.repo.softDelete(id);
  }
}
