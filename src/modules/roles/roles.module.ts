import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { RolePermission } from "../../common/authorization/role-permission.entity";
import { User } from "../users/entities/user.entity";
import { PermissionsController } from "./controllers/permissions.controller";
import { RolesController } from "./controllers/roles.controller";
import { UserRolesController } from "./controllers/user-roles.controller";
import { Role } from "./entities/role.entity";
import { RolesService } from "./services/roles.service";

@Module({
  imports: [TypeOrmModule.forFeature([Role, RolePermission, User])],
  controllers: [RolesController, PermissionsController, UserRolesController],
  providers: [RolesService],
})
export class RolesModule {}
