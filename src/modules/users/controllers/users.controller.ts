import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from "@nestjs/common";
import { Permissions } from "../../../common/decorators/permissions.decorator";
import { crudPermission } from "../../../common/authorization/permission.catalog";
import { CreateUserDto, UpdateUserDto } from "../dto/user.dto";
import { UsersService } from "../services/users.service";

@Controller("equipo")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Permissions(crudPermission("equipo", "read"))
  findAll() {
    return this.usersService.findAll();
  }

  @Get(":id")
  @Permissions(crudPermission("equipo", "read"))
  findOne(@Param("id", ParseUUIDPipe) id: string) {
    return this.usersService.findById(id);
  }

  @Post()
  @Permissions(crudPermission("equipo", "write"))
  create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  @Patch(":id")
  @Permissions(crudPermission("equipo", "update"))
  update(@Param("id", ParseUUIDPipe) id: string, @Body() dto: UpdateUserDto) {
    return this.usersService.update(id, dto);
  }

  @Delete(":id")
  @Permissions(crudPermission("equipo", "delete"))
  remove(@Param("id", ParseUUIDPipe) id: string) {
    return this.usersService.remove(id);
  }
}
