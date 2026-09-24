import { IsString, MinLength } from "class-validator";

export class ChangeMyPasswordDto {
  @IsString()
  currentPassword!: string;

  /** Mismo mínimo que ya rige el alta de usuarios en Equipo (CreateUserDto.password) — no es una regla nueva. */
  @IsString()
  @MinLength(6)
  newPassword!: string;
}
