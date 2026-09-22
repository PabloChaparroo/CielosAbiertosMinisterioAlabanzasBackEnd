import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthorizationService } from "./authorization.service";
import { RolePermission } from "./role-permission.entity";

@Module({
  imports: [TypeOrmModule.forFeature([RolePermission])],
  providers: [AuthorizationService],
  exports: [AuthorizationService],
})
export class AuthorizationModule {}
