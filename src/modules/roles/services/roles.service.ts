import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { GUEST_ROLE_NAME } from "../../../common/authorization/guest";
import { PermissionName } from "../../../common/authorization/permission.catalog";
import { RolePermission } from "../../../common/authorization/role-permission.entity";
import { User } from "../../users/entities/user.entity";
import { CreateRoleDto, RenameRoleDto } from "../dto/role.dto";
import { Role } from "../entities/role.entity";

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepo: Repository<Role>,
    @InjectRepository(RolePermission)
    private readonly rolePermissionRepo: Repository<RolePermission>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async findAllWithPermissionCount(): Promise<Array<Role & { permissionsCount: number }>> {
    const roles = await this.roleRepo.find({ order: { name: "ASC" } });
    if (roles.length === 0) return [];

    const counts = await this.rolePermissionRepo
      .createQueryBuilder("rp")
      .select("rp.role_id", "roleId")
      .addSelect("COUNT(*)", "count")
      .groupBy("rp.role_id")
      .getRawMany<{ roleId: string; count: string }>();
    const countByRoleId = new Map(counts.map((c) => [c.roleId, Number(c.count)]));

    return roles.map((role) => ({ ...role, permissionsCount: countByRoleId.get(role.id) ?? 0 }));
  }

  async findById(id: string): Promise<Role> {
    const role = await this.roleRepo.findOne({ where: { id } });
    if (!role) throw new NotFoundException("Rol no encontrado");
    return role;
  }

  /** Un rol nuevo arranca sin permisos: se otorgan aparte con replacePermissions(). */
  async create(dto: CreateRoleDto): Promise<Role> {
    const existing = await this.roleRepo.findOne({ where: { name: dto.name } });
    if (existing) throw new ConflictException("Ya existe un rol con ese nombre");
    return this.roleRepo.save(this.roleRepo.create({ name: dto.name }));
  }

  async rename(id: string, dto: RenameRoleDto): Promise<Role> {
    const role = await this.findById(id);
    // el acceso de invitados busca este rol por nombre (guest.ts)
    if (role.name === GUEST_ROLE_NAME) {
      throw new BadRequestException("El rol Invitado no se puede renombrar");
    }
    const existing = await this.roleRepo.findOne({ where: { name: dto.name } });
    if (existing && existing.id !== id) throw new ConflictException("Ya existe un rol con ese nombre");
    role.name = dto.name;
    return this.roleRepo.save(role);
  }

  async remove(id: string): Promise<void> {
    const role = await this.findById(id);
    await this.roleRepo.remove(role);
  }

  async getPermissions(id: string): Promise<PermissionName[]> {
    await this.findById(id);
    const rows = await this.rolePermissionRepo.find({ where: { roleId: id } });
    return rows.map((r) => r.permission);
  }

  /** Reemplaza el set completo de permisos del rol por el enviado. */
  async replacePermissions(id: string, permissions: PermissionName[]): Promise<PermissionName[]> {
    await this.findById(id);
    await this.rolePermissionRepo.delete({ roleId: id });
    if (permissions.length > 0) {
      await this.rolePermissionRepo.save(
        permissions.map((permission) => this.rolePermissionRepo.create({ roleId: id, permission })),
      );
    }
    return permissions;
  }

  private async findUserWithRoles(userId: string): Promise<User> {
    const user = await this.userRepo.findOne({ where: { id: userId }, relations: { roles: true } });
    if (!user) throw new NotFoundException("Integrante no encontrado");
    return user;
  }

  async assignToUser(userId: string, roleId: string): Promise<Role[]> {
    const [user, role] = await Promise.all([this.findUserWithRoles(userId), this.findById(roleId)]);
    if (role.name === GUEST_ROLE_NAME) {
      throw new BadRequestException("El rol Invitado es para el acceso sin cuenta: no se asigna a integrantes");
    }
    if (!user.roles.some((r) => r.id === roleId)) {
      user.roles = [...user.roles, role];
      await this.userRepo.save(user);
    }
    return user.roles;
  }

  async removeFromUser(userId: string, roleId: string): Promise<Role[]> {
    const user = await this.findUserWithRoles(userId);
    user.roles = user.roles.filter((r) => r.id !== roleId);
    await this.userRepo.save(user);
    return user.roles;
  }
}
