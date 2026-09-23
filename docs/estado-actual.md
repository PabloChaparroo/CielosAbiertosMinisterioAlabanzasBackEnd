# Estado actual — changelog vivo

Orden cronológico inverso. Cada entrada documenta motivo de negocio, alcance acotado, detalle técnico, bugs encontrados de paso y qué quedó verificado vs. sin verificar (ver sección 6 de `claude/stack-y-patrones-base.md` en el frontend). La primera entrada del archivo no reconstruyó retroactivamente el historial de sesiones previas (scaffold inicial, refactor a features, fix de vulnerabilidades, alta de `AudioTrack`).

---

## 2026-09-23 — Gestión de Roles y Permisos (backend)

**Motivo de negocio:** Pablo pidió reemplazar el sistema de roles fijo (3 valores hardcodeados con `@Check`) por uno dinámico: un admin puede crear roles nuevos y decidir qué permisos tiene cada uno desde una pantalla de administración, sin tocar código. Es la primera vez que se toca el mecanismo de autorización desde el scaffold inicial — no es una feature aislada, es un reemplazo del corazón del sistema de permisos.

**Alcance:** Backend completo (entidades, migración, endpoints). El frontend queda mockeado por decisión explícita — el proyecto no tiene todavía cliente HTTP ni login real, y conectar solo esta pantalla al backend real habría sido adelantar la integración de una sola pantalla mientras el resto sigue mockeado. Se decidió también, a pedido, **sin ventana de vigencia** en `User↔Role`: relación M:N simple, sin fechas desde/hasta — no había necesidad de negocio concreta que la justificara.

**Detalle técnico:**

- **`Role`** (`roles`): `id`, `name` (único, texto libre, sin `@Check`) — reemplaza el `User.role` fijo.
- **`User.role`** (columna + `@Check` admin/lider/musico) **se eliminó**. Se reemplaza por `User.roles`, `@ManyToMany` hacia `Role` vía tabla puente `user_roles`, sin entidad de join propia (mismo patrón ya usado en `Setlist.team`/`Song.tags`).
- **`RolePermission`** cambió de `(role: string, permission: string)` a `(roleId: uuid FK → Role, permission: string)` — pasa de comparar por valor a tener una relación TypeORM real (`@ManyToOne`, `onDelete: CASCADE`).
- **`AuthorizationService.getPermissionsForRole(role)`** → **`getPermissionsForUser(userId)`**: agrega (unión sin duplicados) los permisos de *todos* los roles que tenga el usuario, vía join contra `user_roles`.
- Nuevo recurso de catálogo **`rol`** (`rol:read/write/update/delete`): gobierna crear/renombrar/borrar roles, editar su set de permisos, y asignar/quitar roles a un usuario. Se decidió que viva separado de `equipo:*` (que sigue siendo solo para editar el perfil de un integrante) para no atar administración de accesos a permisos de edición de perfil.
- **Bug real corregido de paso**: `AnnotationsService.assertCanEdit` tenía hardcodeado `user.role === "admin" || user.role === "lider"`, bypaseando el catálogo de permisos y rompiendo con el nuevo modelo (ya no hay un string de rol garantizado). Se reemplazó por `user.permissions.includes("anotacion:update"/"anotacion:delete")` — mismo criterio, expresado en el propio catálogo en vez de duplicado como caso especial.
- Nuevos endpoints: `GET /permisos` (catálogo agrupado por recurso, fuente única de verdad para el frontend), CRUD de `/roles` + `PATCH /roles/:id/permisos` (reemplaza el set completo, no incremental — se explicó la razón: la UI de tarjetas con checkboxes ya arma el estado completo deseado antes de guardar), y `POST`/`DELETE /equipo/:userId/roles/:roleId` para asignar/quitar.
- Migración `AddRolesAndPermissions`: crea `roles`/`user_roles`, recrea `role_permissions` con la nueva forma, siembra 3 roles (Admin/Líder/Músico) con los mismos permisos que ya estaban vigentes, migra los usuarios existentes según su `role` anterior, y recién ahí borra la columna/constraint vieja. `down()` revierte completo, incluyendo picking de rol único por prioridad Admin > Líder > Músico si un usuario terminó con más de uno (limitación documentada en el propio migration, inherente a volver de M:N a un solo valor).

**Verificado con requests HTTP reales** (no solo `tsc`): migración corrida contra la base ya poblada de sesiones anteriores (no una base limpia); login trayendo `roles`/`permissions` correctos; creación de un rol nuevo arrancando sin permisos; `PATCH .../permisos` con un permiso que ningún otro rol del usuario tenía, confirmando que el login siguiente lo agrega a la unión; remoción del rol confirmando que el permiso desaparece; un usuario sin `rol:write` recibiendo 403 al intentar crear un rol; y el flujo completo de moderación de anotaciones (autora, no-autora sin permiso → 403, líder con permiso → edita) para confirmar que el fix de `AnnotationsService` no rompió el comportamiento existente.

**Sin verificar:** la pantalla de frontend (queda mockeada, pendiente del pase de conexión real al backend). No se agregó soft-delete a `Role` — si se borra un rol en uso, los usuarios simplemente lo pierden (cascada en `user_roles` y en `role_permissions`); no se pidió lo contrario, pero es un punto a confirmar con Pablo si en el futuro se necesita auditoría de qué rol tuvo cada usuario históricamente.

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
