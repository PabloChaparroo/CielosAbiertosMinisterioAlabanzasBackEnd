import "reflect-metadata";
import { ClassConstructor, plainToInstance } from "class-transformer";
import { ValidationError, validate } from "class-validator";

/**
 * Solo para tests: valida un body como lo hace la API real (ValidationPipe global de main.ts:
 * transform + whitelist + forbidNonWhitelisted). Devuelve la instancia transformada y las rutas
 * de los campos con error ("items.0.songId"), para afirmar sobre reglas concretas.
 */
export async function validateDto<T extends object>(cls: ClassConstructor<T>, body: object) {
  const instance = plainToInstance(cls, body);
  const errors = await validate(instance, { whitelist: true, forbidNonWhitelisted: true });
  return { instance, fields: flatten(errors) };
}

function flatten(errors: ValidationError[], prefix = ""): string[] {
  return errors.flatMap((e) => {
    const path = prefix ? `${prefix}.${e.property}` : e.property;
    return e.children?.length ? flatten(e.children, path) : [path];
  });
}
