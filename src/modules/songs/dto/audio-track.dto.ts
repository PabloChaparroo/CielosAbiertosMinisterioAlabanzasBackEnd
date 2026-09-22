import { PartialType } from "@nestjs/swagger";
import { IsInt, IsOptional, IsString, Min } from "class-validator";

export class CreateAudioTrackDto {
  /** Texto libre puesto por quien sube la pista, ej. "Click y guía". Sin catálogo fijo. */
  @IsString()
  label!: string;

  /** Key devuelta por POST /storage/upload-url tras subir el binario al bucket */
  @IsString()
  audioKey!: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;
}

export class UpdateAudioTrackDto extends PartialType(CreateAudioTrackDto) {}
