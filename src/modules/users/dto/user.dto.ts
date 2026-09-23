import { PartialType } from "@nestjs/swagger";
import { ArrayNotEmpty, IsArray, IsEmail, IsString, MinLength } from "class-validator";

export class CreateUserDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(6)
  password!: string;

  @IsString()
  name!: string;

  @IsString()
  ministryRole!: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  instruments!: string[];

  @IsString()
  avatarColor!: string;

  @IsString()
  initials!: string;
}

export class UpdateUserDto extends PartialType(CreateUserDto) {}
