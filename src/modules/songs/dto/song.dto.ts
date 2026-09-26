import { PartialType } from "@nestjs/swagger";
import { ArrayNotEmpty, IsArray, IsInt, IsOptional, IsString, IsUUID, Min } from "class-validator";

export class CreateSongDto {
  @IsString()
  title!: string;

  @IsString()
  artist!: string;

  @IsString()
  key!: string;

  @IsInt()
  @Min(1)
  bpm!: number;

  @IsString()
  compas!: string;

  @IsInt()
  @Min(1)
  duration!: number;

  @IsString()
  cover!: string;

  @IsOptional()
  @IsString()
  audioKey?: string;

  @IsString()
  chordpro!: string;

  @IsOptional()
  @IsString()
  lyricsImageKey?: string;

  /** Key de la portada subida por URL firmada (carpeta "portadas"); null la quita */
  @IsOptional()
  @IsString()
  coverKey?: string | null;

  /** Tipo de canción (GET /tipos-cancion), obligatorio */
  @IsUUID()
  tipoId!: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  tags!: string[];
}

export class UpdateSongDto extends PartialType(CreateSongDto) {}
