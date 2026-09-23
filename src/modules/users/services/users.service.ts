import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import * as bcrypt from "bcrypt";
import { Repository } from "typeorm";
import { CreateUserDto, UpdateUserDto } from "../dto/user.dto";
import { User } from "../entities/user.entity";

const SALT_ROUNDS = 10;

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  findAll(incluirBajas = false): Promise<User[]> {
    return this.userRepo.find({
      relations: { roles: true },
      order: { fechaHoraAlta: "ASC" },
      withDeleted: incluirBajas,
    });
  }

  async findById(id: string): Promise<User> {
    const user = await this.userRepo.findOne({ where: { id }, relations: { roles: true } });
    if (!user) throw new NotFoundException("Integrante no encontrado");
    return user;
  }

  findByEmailWithPassword(email: string): Promise<User | null> {
    return this.userRepo
      .createQueryBuilder("user")
      .addSelect("user.passwordHash")
      .leftJoinAndSelect("user.roles", "roles")
      .where("user.email = :email", { email })
      .getOne();
  }

  async create(dto: CreateUserDto): Promise<User> {
    const passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS);
    const user = this.userRepo.create({
      email: dto.email,
      passwordHash,
      name: dto.name,
      ministryRole: dto.ministryRole,
      instruments: dto.instruments,
      avatarColor: dto.avatarColor,
      initials: dto.initials,
    });
    return this.userRepo.save(user);
  }

  async update(id: string, dto: UpdateUserDto): Promise<User> {
    const user = await this.findById(id);
    if (dto.password) {
      user.passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS);
    }
    Object.assign(user, {
      ...(dto.email !== undefined && { email: dto.email }),
      ...(dto.name !== undefined && { name: dto.name }),
      ...(dto.ministryRole !== undefined && { ministryRole: dto.ministryRole }),
      ...(dto.instruments !== undefined && { instruments: dto.instruments }),
      ...(dto.avatarColor !== undefined && { avatarColor: dto.avatarColor }),
      ...(dto.initials !== undefined && { initials: dto.initials }),
    });
    return this.userRepo.save(user);
  }

  async remove(id: string): Promise<void> {
    const user = await this.findById(id);
    await this.userRepo.softRemove(user);
  }
}
