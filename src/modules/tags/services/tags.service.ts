import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { In, Repository } from "typeorm";
import { Tag, TagValue } from "../entities/tag.entity";

@Injectable()
export class TagsService {
  constructor(
    @InjectRepository(Tag)
    private readonly tagRepo: Repository<Tag>,
  ) {}

  findAll(): Promise<Tag[]> {
    return this.tagRepo.find({ order: { valor: "ASC" } });
  }

  findByValues(valores: string[]): Promise<Tag[]> {
    if (valores.length === 0) return Promise.resolve([]);
    return this.tagRepo.find({ where: { valor: In(valores as TagValue[]) } });
  }
}
