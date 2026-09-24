import { PartialType } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsDateString,
  IsIn,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from "class-validator";
import { EVENT_TYPES, EventType } from "../entities/setlist.entity";

export class SetlistItemDto {
  @IsUUID()
  songId!: string;

  @IsString()
  key!: string;

  @IsOptional()
  @IsString()
  note?: string;
}

export class CreateSetlistDto {
  @IsString()
  title!: string;

  @IsDateString()
  date!: string;

  @IsOptional()
  @IsBoolean()
  isUpcoming?: boolean;

  @IsIn(EVENT_TYPES)
  type!: EventType;

  @IsUUID()
  leaderId!: string;

  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => SetlistItemDto)
  items!: SetlistItemDto[];

  @IsArray()
  @IsUUID(undefined, { each: true })
  teamIds!: string[];
}

export class UpdateSetlistDto extends PartialType(CreateSetlistDto) {}
