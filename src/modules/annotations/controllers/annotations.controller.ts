import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from "@nestjs/common";
import { IsUUID } from "class-validator";
import { crudPermission } from "../../../common/authorization/permission.catalog";
import { CurrentUser } from "../../../common/decorators/current-user.decorator";
import { Permissions } from "../../../common/decorators/permissions.decorator";
import { AuthenticatedUser } from "../../auth/types/authenticated-user";
import { CreateAnnotationDto, UpdateAnnotationDto } from "../dto/annotation.dto";
import { AnnotationsService } from "../services/annotations.service";

class FindBySongQuery {
  @IsUUID()
  songId!: string;
}

@Controller("anotaciones")
export class AnnotationsController {
  constructor(private readonly annotationsService: AnnotationsService) {}

  @Get()
  @Permissions(crudPermission("anotacion", "read"))
  findBySong(@Query() query: FindBySongQuery) {
    return this.annotationsService.findBySong(query.songId);
  }

  @Post()
  @Permissions(crudPermission("anotacion", "write"), crudPermission("anotacion-propia", "write"))
  create(@Body() dto: CreateAnnotationDto, @CurrentUser() user: AuthenticatedUser) {
    return this.annotationsService.create(dto, user);
  }

  @Patch(":id")
  @Permissions(
    crudPermission("anotacion", "update"),
    crudPermission("anotacion-propia", "update"),
  )
  update(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpdateAnnotationDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.annotationsService.update(id, dto, user);
  }

  @Delete(":id")
  @Permissions(
    crudPermission("anotacion", "delete"),
    crudPermission("anotacion-propia", "delete"),
  )
  remove(@Param("id", ParseUUIDPipe) id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.annotationsService.remove(id, user);
  }
}
