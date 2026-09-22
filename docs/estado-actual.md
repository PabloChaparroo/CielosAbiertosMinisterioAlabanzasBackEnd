# Estado actual — changelog vivo

Orden cronológico inverso. Cada entrada documenta motivo de negocio, alcance acotado, detalle técnico, bugs encontrados de paso y qué quedó verificado vs. sin verificar (ver sección 6 de `claude/stack-y-patrones-base.md` en el frontend). Esta es la primera entrada del archivo — no se reconstruyó retroactivamente el historial de sesiones previas (scaffold inicial, refactor a features, fix de vulnerabilidades, alta de `AudioTrack`).

---

## 2026-09-22 — Pin de TypeScript a la serie estable 5.x y fix de watch mode

**Motivo de negocio:** Pablo reportó dos avisos del editor en `tsconfig.json` ("el `rootDir` debe fijarse explícitamente" y "`baseUrl` está deprecado") y sospechó que el backend había quedado con TypeScript 7 (preview/latest) instalado, generando drift de versión respecto del frontend — que fija `^5.8.x` — y repitiendo la causa raíz que ya nos había obligado a esquivar `@nestjs/cli generate` durante el scaffold inicial.

**Alcance acotado:** Exclusivamente versión de TypeScript y su configuración asociada. No se tocó schema de base de datos, entidades ni lógica de negocio (pedido explícito).

**Detalle técnico:**

- Se verificó `package.json` y `package-lock.json`: `typescript` ya estaba fijado en `"^5.8.3"` — **idéntico** al string declarado en el frontend — y resolviendo a `5.9.3` (la última versión estable de la serie 5.x, confirmada contra el registro de npm). No había drift real ni TypeScript 7 instalado; la hipótesis inicial de Pablo no se confirmó para el paquete `typescript` en sí.
- `tsconfig.json` ya tenía el fix de una sesión anterior (`rootDir: "./src"` explícito, sin `baseUrl`, `paths` con rutas relativas `"./src/*"`), y `tsc --noEmit` ya daba limpio antes de tocar nada en esta sesión.
- **Bug real encontrado de paso** (no relacionado con TypeScript): al re-probar `npm run dev` de punta a punta, el paso `start:dev` fallaba — `@swc/cli@0.8.1` (versión a la que se forzó el upgrade en la sesión de fix de vulnerabilidades de npm) requiere `chokidar` como *peer dependency opcional* para el flag `-w` (watch), y no estaba instalado (`Error: Cannot find module 'chokidar'`). Se agregó `chokidar: "^5.0.0"` como devDependency explícita.
- Se corrió `npm install` (sin cambios de versión de `typescript`, ya estaba correcto) y se re-verificó `npm run dev` completo con los contenedores parados desde cero: `docker compose down` → `npm run dev` → creación/arranque de contenedores → polling de Postgres → `migration:run` (sin pendientes) → `start:dev` en watch mode → Nest arriba con todas las rutas mapeadas, incluidas las de `pistas`/`AudioTrack` agregadas en la sesión anterior.

**Sobre `@nestjs/cli`/`@nestjs/schematics`:** siguen sin poder instalarse junto con TypeScript 5.x estable, y esto **no** es un efecto del drift a TS7 que se sospechaba. `@nestjs/schematics` (única versión publicada hoy, la de la línea Nest 12) declara `peerDependencies: { typescript: ">=6.0.0" }` — es un requisito estructural de esa versión de schematics, no algo que se arregle bajando de una versión "mala" de TypeScript a una "buena": mientras el proyecto se mantenga en Nest 12 + TypeScript 5.x (para no arrastrar los cambios de la serie 6/7, todavía muy nueva), el workaround de `swc --watch` + `node --watch` en vez de `nest generate`/`nest start --watch` sigue siendo necesario. No se migró nada de vuelta a la CLI de Nest.

**Verificado:**
- `tsc --noEmit` sin salida, exit code 0.
- `npm run dev` de punta a punta desde cero (containers abajo → arriba, polling, migraciones, arranque en watch mode) con request real a `/api/health` respondiendo `status: ok`.
- `npm install` sin conflictos de peer dependencies, 0 vulnerabilidades.

**Sin verificar:**
- Si el editor de Pablo deja de mostrar los dos avisos después de este cambio. El archivo de config y la versión resuelta de TypeScript ya eran correctos *antes* de este cambio (ambos arreglados en una sesión previa), así que si los avisos persisten en el editor, lo más probable es un TS Language Server desactualizado/cacheado en VS Code (acción sugerida: "TypeScript: Restart TS Server" o recargar la ventana), no un problema real del proyecto.
