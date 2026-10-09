import { PartialType } from "@nestjs/swagger";
import { IsArray, IsInt, IsOptional, IsString, IsUUID, MaxLength, Min } from "class-validator";

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

  /** Nombre del audio principal; vacío lo quita (se muestra el título de la canción) */
  @IsOptional()
  @IsString()
  @MaxLength(120)
  audioName?: string;

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

  /** Temas: pueden ser ninguno ("Adoración"/"Alabanza" son tipos, no temas) */
  @IsArray()
  @IsString({ each: true })
  tags!: string[];
}

export class UpdateSongDto extends PartialType(CreateSongDto) {}
