import { PartialType } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { ArrayNotEmpty, IsArray, IsString, MinLength, ValidateNested } from "class-validator";
import { SetlistItemDto } from "./setlist.dto";

export class CreateSetlistTemplateDto {
  @IsString()
  @MinLength(1)
  title!: string;

  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => SetlistItemDto)
  items!: SetlistItemDto[];
}

export class UpdateSetlistTemplateDto extends PartialType(CreateSetlistTemplateDto) {}
