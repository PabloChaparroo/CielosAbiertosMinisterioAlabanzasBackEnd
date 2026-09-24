import { PartialType } from "@nestjs/swagger";
import { IsInt, IsOptional, IsString, IsUrl, Min } from "class-validator";

export class CreateSongLinkDto {
  @IsString()
  label!: string;

  @IsUrl()
  url!: string;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;
}

export class UpdateSongLinkDto extends PartialType(CreateSongLinkDto) {}
