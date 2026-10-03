import { PartialType } from "@nestjs/swagger";
import { IsArray, IsEmail, IsIn, IsOptional, IsString, MinLength } from "class-validator";
import { INSTRUMENTS } from "../instruments";

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

  /** Instrumentos que toca (puede ser más de uno) */
  @IsOptional()
  @IsArray()
  @IsIn(INSTRUMENTS, { each: true })
  instruments?: string[];
}

export class UpdateUserDto extends PartialType(CreateUserDto) {}
