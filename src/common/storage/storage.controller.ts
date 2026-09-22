import { Body, Controller, Post } from "@nestjs/common";
import { IsIn, IsString } from "class-validator";
import { StorageService } from "./storage.service";

class UploadUrlDto {
  @IsIn(["audios", "letras"])
  folder!: "audios" | "letras";

  @IsString()
  contentType!: string;
}

@Controller("storage")
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @Post("upload-url")
  getUploadUrl(@Body() dto: UploadUrlDto) {
    return this.storageService.getUploadUrl(dto.folder, dto.contentType);
  }
}
