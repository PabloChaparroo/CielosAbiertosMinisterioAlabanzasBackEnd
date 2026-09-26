import { Controller, Get } from "@nestjs/common";
import { AllowGuests } from "../../../common/decorators/allow-guests.decorator";
import { TagsService } from "../services/tags.service";

@Controller("tags")
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  /** Catálogo de temas para el formulario y los filtros (lectura; invitados incluidos) */
  @Get()
  @AllowGuests()
  findAll() {
    return this.tagsService.findAll();
  }
}
