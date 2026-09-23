import * as Joi from "joi";

export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string().valid("development", "production", "test").default("development"),
  PORT: Joi.number().default(3000),

  DB_HOST: Joi.string().required(),
  DB_PORT: Joi.number().required(),
  DB_USER: Joi.string().required(),
  DB_PASSWORD: Joi.string().required(),
  DB_NAME: Joi.string().required(),

  JWT_SECRET: Joi.string().required(),
  JWT_EXPIRES_IN: Joi.string().default("8h"),

  S3_ENDPOINT: Joi.string().required(),
  S3_REGION: Joi.string().required(),
  S3_BUCKET: Joi.string().required(),
  S3_ACCESS_KEY: Joi.string().required(),
  S3_SECRET_KEY: Joi.string().required(),
  S3_FORCE_PATH_STYLE: Joi.boolean().default(true),

  FRONTEND_URL: Joi.string().required(),

  QUEUE_REDIS_HOST: Joi.string().default("127.0.0.1"),
  QUEUE_REDIS_PORT: Joi.number().default(6379),
  QUEUE_REDIS_PASSWORD: Joi.string().allow("").default(""),
});

/**
 * @nestjs/config v12 espera validadores "standard-schema" (zod/valibot) en
 * `validationSchema`; Joi no lo implementa, así que validamos a mano acá y
 * lo enchufamos vía `validate` en ConfigModule.forRoot().
 */
export function validateEnv(config: Record<string, unknown>): Record<string, unknown> {
  const { error, value } = envValidationSchema.validate(config, { allowUnknown: true });
  if (error) throw new Error(`Config de entorno inválida: ${error.message}`);
  return value as Record<string, unknown>;
}
