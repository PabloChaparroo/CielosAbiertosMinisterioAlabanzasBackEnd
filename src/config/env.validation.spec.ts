import { describe, expect, it } from "vitest";
import { validateEnv } from "./env.validation";

// Mínimo que exige el arranque (local o Render); cada test cambia una cosa
const base = {
  DB_HOST: "localhost",
  DB_PORT: "5435",
  DB_USER: "cielos",
  DB_PASSWORD: "cielos",
  DB_NAME: "cielos_abiertos_alabanzas",
  JWT_SECRET: "secreto",
  S3_ENDPOINT: "http://localhost:9002",
  S3_REGION: "us-east-1",
  S3_BUCKET: "bucket",
  S3_ACCESS_KEY: "clave",
  S3_SECRET_KEY: "secreto",
  FRONTEND_URL: "http://localhost:8080",
};

describe("validateEnv — variables de entorno al arrancar", () => {
  it("en local, sin DB_SSL, queda en false (el Postgres de Docker no tiene SSL)", () => {
    expect(validateEnv(base)["DB_SSL"]).toBe(false);
  });

  it("en producción, DB_SSL=true (texto, como lo carga Render) se convierte a true", () => {
    expect(validateEnv({ ...base, DB_SSL: "true" })["DB_SSL"]).toBe(true);
  });

  it("aplica los valores por defecto (puerto 3000, sesión de 8h, desarrollo)", () => {
    expect(validateEnv(base)).toMatchObject({ PORT: 3000, JWT_EXPIRES_IN: "8h", NODE_ENV: "development" });
  });

  it("no arranca sin JWT_SECRET", () => {
    const { JWT_SECRET: _, ...sinSecreto } = base;
    expect(() => validateEnv(sinSecreto)).toThrow(/JWT_SECRET/);
  });

  it("no arranca con un NODE_ENV inventado", () => {
    expect(() => validateEnv({ ...base, NODE_ENV: "staging" })).toThrow(/NODE_ENV/);
  });

  it("no arranca sin FRONTEND_URL (sin eso, CORS bloquearía el frontend)", () => {
    const { FRONTEND_URL: _, ...sinFrontend } = base;
    expect(() => validateEnv(sinFrontend)).toThrow(/FRONTEND_URL/);
  });
});
