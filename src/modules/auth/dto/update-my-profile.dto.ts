import { IsOptional, IsString } from "class-validator";

/**
 * Deliberadamente NO tiene email ni roles: "mi perfil" nunca puede tocar
 * eso, ni siquiera omitiéndolos por error — directamente no existen como
 * campos aceptables en este DTO. Eso sigue siendo exclusivo del ABM de
 * admin en Equipo (equipo:update).
 */
export class UpdateMyProfileDto {
  @IsOptional()
  @IsString()
  name?: string;

  /** Key devuelta por POST /storage/upload-url tras subir el binario al bucket */
  @IsOptional()
  @IsString()
  avatarKey?: string;
}
