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

  async findAll(incluirBajas = false): Promise<User[]> {
    const users = await this.userRepo.find({
      relations: { roles: true },
      order: { fechaHoraAlta: "ASC" },
      withDeleted: incluirBajas,
    });
    // admin = tiene un rol que administra roles (rol:write): el frontend se lo oculta a quien no
    // es admin en Equipo y al armar listas. Por permiso, no por el nombre del rol.
    const admins: Array<{ user_id: string }> = await this.userRepo.query(
      `SELECT DISTINCT ur.user_id FROM "user_roles" ur
       JOIN "role_permissions" rp ON rp.role_id = ur.role_id
       WHERE rp.permission = 'rol:write'`,
    );
    const adminIds = new Set(admins.map((row) => row.user_id));
    users.forEach((user) => (user.isAdmin = adminIds.has(user.id)));
    return users;
  }

  /** true si existe y no está dado de baja (las bajas lógicas quedan excluidas por defecto) */
  isActive(id: string): Promise<boolean> {
    return this.userRepo.exists({ where: { id } });
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

  /** Para verificar la contraseña actual antes de cambiarla — mismo patrón que findByEmailWithPassword, pero por id (ya autenticado). */
  async findByIdWithPassword(id: string): Promise<User> {
    const user = await this.userRepo
      .createQueryBuilder("user")
      .addSelect("user.passwordHash")
      .where("user.id = :id", { id })
      .getOne();
    if (!user) throw new NotFoundException("Usuario no encontrado");
    return user;
  }

  async create(dto: CreateUserDto): Promise<User> {
    const passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS);
    const user = this.userRepo.create({
      email: dto.email,
      passwordHash,
      name: dto.name,
      avatarColor: dto.avatarColor,
      initials: dto.initials,
      instruments: [...new Set(dto.instruments ?? [])],
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
      ...(dto.avatarColor !== undefined && { avatarColor: dto.avatarColor }),
      ...(dto.initials !== undefined && { initials: dto.initials }),
      ...(dto.instruments !== undefined && { instruments: [...new Set(dto.instruments)] }),
    });
    return this.userRepo.save(user);
  }

  /**
   * "Mi perfil" — deliberadamente separado de update() (el que usa el ABM
   * de admin en Equipo, gateado por equipo:update). Este método no toma
   * email/roles porque el DTO que lo llama (UpdateMyProfileDto) ni
   * siquiera los tiene como campos posibles.
   */
  async updateOwnProfile(
    id: string,
    dto: { name?: string; avatarKey?: string },
  ): Promise<User> {
    const user = await this.findById(id);
    Object.assign(user, {
      ...(dto.name !== undefined && { name: dto.name }),
      ...(dto.avatarKey !== undefined && { avatarKey: dto.avatarKey }),
    });
    return this.userRepo.save(user);
  }

  async updatePasswordHash(id: string, passwordHash: string): Promise<void> {
    await this.userRepo.update({ id }, { passwordHash });
  }

  async remove(id: string): Promise<void> {
    const user = await this.findById(id);
    await this.userRepo.softRemove(user);
  }
}
