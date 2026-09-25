import { PartialType } from "@nestjs/swagger";
import { IsEmail, IsString, MinLength } from "class-validator";

export class CreateUserDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(6)
  password!: string;

  @IsString()
  name!: string;

  @IsString()
  avatarColor!: string;

  @IsString()
  initials!: string;
}

export class UpdateUserDto extends PartialType(CreateUserDto) {}
