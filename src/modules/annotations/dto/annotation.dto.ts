import { IsString, IsUUID } from "class-validator";

export class CreateAnnotationDto {
  @IsUUID()
  songId!: string;

  @IsString()
  text!: string;
}

export class UpdateAnnotationDto {
  @IsString()
  text!: string;
}
