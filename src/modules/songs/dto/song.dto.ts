import { PartialType } from "@nestjs/swagger";
import { ArrayNotEmpty, IsArray, IsInt, IsOptional, IsString, Min } from "class-validator";

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

  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  tags!: string[];
}

export class UpdateSongDto extends PartialType(CreateSongDto) {}
