#!/usr/bin/env node
/**
 * Arranque "un solo comando": levanta Docker (Postgres/MinIO/Redis), espera a que
 * Postgres acepte conexiones, corre migraciones y arranca la app en watch mode.
 * Node puro (sin bash/PowerShell) para correr igual en Windows/Mac/Linux.
 */
const fs = require("fs");
const path = require("path");
const { spawnSync, spawn } = require("child_process");

const ROOT = path.resolve(__dirname, "..");
const ENV_PATH = path.join(ROOT, ".env");
const ENV_EXAMPLE_PATH = path.join(ROOT, ".env.example");

function ensureEnvFile() {
  if (!fs.existsSync(ENV_PATH)) {
    fs.copyFileSync(ENV_EXAMPLE_PATH, ENV_PATH);
    console.log("[dev] .env creado a partir de .env.example");
  }
}

function loadEnv() {
  require("dotenv").config({ path: ENV_PATH });
  return {
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 5432,
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "postgres",
    database: process.env.DB_NAME || "postgres",
  };
}

function startPostgres() {
  const result = spawnSync("docker", ["compose", "up", "-d"], {
    cwd: ROOT,
    stdio: "inherit",
    shell: process.platform === "win32",
  });
  if (result.status !== 0) {
    console.error(
      "\n[dev] No se pudo levantar Docker.\n" +
        "¿Está Docker Desktop abierto y corriendo? Abrilo, esperá a que el ícono\n" +
        "esté listo (no 'starting'), y volvé a correr `npm run dev`.\n",
    );
    process.exit(1);
  }
}

async function waitForPostgres(dbConfig) {
  const { Client } = require("pg");
  const maxAttempts = 30;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const client = new Client(dbConfig);
    try {
      await client.connect();
      await client.end();
      console.log("[dev] Postgres listo");
      return;
    } catch {
      await client.end().catch(() => {});
      await new Promise((r) => setTimeout(r, 1000));
    }
  }
  const findPortCmd =
    process.platform === "win32"
      ? `netstat -ano | findstr ${dbConfig.port}`
      : `lsof -i :${dbConfig.port}`;
  console.error(
    `\n[dev] No se pudo conectar a Postgres en ${dbConfig.host}:${dbConfig.port} tras ${maxAttempts}s.\n` +
      "Causas posibles:\n" +
      `  - Otro Postgres (nativo u otro proyecto) ya está usando el puerto ${dbConfig.port}.\n` +
      `    Diagnóstico: ${findPortCmd}\n` +
      "  - Docker todavía está iniciando el contenedor, esperá unos segundos y reintentá.\n" +
      "Si el puerto está ocupado, cambiá DB_PORT en tu .env.\n",
  );
  process.exit(1);
}

function runMigrations() {
  const result = spawnSync("npm", ["run", "migration:run"], {
    cwd: ROOT,
    stdio: "inherit",
    shell: process.platform === "win32",
  });
  if (result.status !== 0) {
    console.error("\n[dev] Falló una migración. Revisá el error de TypeORM arriba.\n");
    process.exit(1);
  }
}

function startApp() {
  const child = spawn("npm", ["run", "start:dev"], {
    cwd: ROOT,
    stdio: "inherit",
    shell: process.platform === "win32",
  });
  child.on("exit", (code) => process.exit(code ?? 0));
}

async function main() {
  ensureEnvFile();
  const dbConfig = loadEnv();
  startPostgres();
  await waitForPostgres(dbConfig);
  runMigrations();
  startApp();
}

main();
