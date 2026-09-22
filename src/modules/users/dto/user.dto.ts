import { PartialType } from "@nestjs/swagger";
import { ArrayNotEmpty, IsArray, IsEmail, IsIn, IsString, MinLength } from "class-validator";
import { SYSTEM_ROLES, SystemRole } from "../entities/user.entity";

export class CreateUserDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(6)
  password!: string;

  @IsString()
  name!: string;

  @IsIn(SYSTEM_ROLES)
  role!: SystemRole;

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
