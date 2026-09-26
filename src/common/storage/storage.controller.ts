import { Body, Controller, Get, Post, Query } from "@nestjs/common";
import { IsIn, IsString } from "class-validator";
import { AllowGuests } from "../decorators/allow-guests.decorator";
import { StorageService } from "./storage.service";

class UploadUrlDto {
  @IsIn(["audios", "letras", "avatares", "portadas"])
  folder!: "audios" | "letras" | "avatares" | "portadas";

  @IsString()
  contentType!: string;
}

class DownloadUrlQuery {
  @IsString()
  key!: string;
}

/**
 * Sin permiso especial en ninguno de los dos endpoints, a propósito: no hay
 * ningún concepto de canción/archivo privado en el modelo (Song no tiene
 * owner ni flag de visibilidad, y los 4 roles del seed —incluido Músico—
 * tienen cancion:read). Quien puede ver una canción en el listado ya puede
 * reproducirla; el JWT global alcanza como gate, no hace falta duplicar
 * cancion:read acá.
 */
@Controller("storage")
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @Post("upload-url")
  getUploadUrl(@Body() dto: UploadUrlDto) {
    return this.storageService.getUploadUrl(dto.folder, dto.contentType);
  }

  // un invitado puede escuchar las canciones (bajar el audio); subir (upload-url) no
  @Get("download-url")
  @AllowGuests()
  async getDownloadUrl(@Query() query: DownloadUrlQuery) {
    return { url: await this.storageService.getDownloadUrl(query.key) };
  }
}
