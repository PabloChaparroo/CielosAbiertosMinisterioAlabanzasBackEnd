import { defineConfig } from "vitest/config";

/**
 * Tests unitarios: co-ubicados junto al archivo que testean (`x.service.spec.ts` al lado de
 * `x.service.ts`), con dependencias simuladas a mano — sin levantar Nest ni la base de datos.
 * Ver claude/stack-y-patrones-base.md (frontend), sección 5.
 */
export default defineConfig({
  test: {
    include: ["src/**/*.spec.ts"],
    environment: "node",
  },
});
