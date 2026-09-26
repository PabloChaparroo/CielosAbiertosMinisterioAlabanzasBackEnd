import { Controller, Get } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { AllowGuests } from "../../../common/decorators/allow-guests.decorator";
import { TipoCancion } from "../entities/tipo-cancion.entity";

/** Lista de tipos de canción para el formulario y el filtro (solo lectura; invitados incluidos) */
@Controller("tipos-cancion")
export class TiposCancionController {
  constructor(
    @InjectRepository(TipoCancion)
    private readonly tipoRepo: Repository<TipoCancion>,
  ) {}

  @Get()
  @AllowGuests()
  findAll() {
    return this.tipoRepo.find({ order: { nombre: "ASC" } });
  }
}
