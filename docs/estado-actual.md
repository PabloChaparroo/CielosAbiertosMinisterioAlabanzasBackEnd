# Estado actual — changelog vivo

Orden cronológico inverso. Cada entrada documenta motivo de negocio, alcance acotado, detalle técnico, bugs encontrados de paso y qué quedó verificado vs. sin verificar (ver sección 6 de `claude/stack-y-patrones-base.md` en el frontend). La primera entrada del archivo no reconstruyó retroactivamente el historial de sesiones previas (scaffold inicial, refactor a features, fix de vulnerabilidades, alta de `AudioTrack`).

---

## 2026-09-24 — Conexión real de la pantalla "Roles y Permisos" (frontend)

**Motivo de negocio:** la pantalla de Roles y Permisos seguía mockeada desde el ticket original. Pablo pidió conectarla al backend real, eliminando el mock por completo (sin fallback, sin convivencia) — mismo patrón de reemplazo ya usado en el ticket de login.

**Alcance:** exclusivamente esta pantalla (`features/roles-permisos/`). No se tocó login/`AuthGate`, no se implementó asignación de roles a usuarios (ver hueco funcional abajo), y el badge del Sidebar quedó **explícitamente sin resolver** — es un mock separado (`members` en `mocks/data.ts`, con su propio campo `role` fijo), compartido con `EquipoPage`/`MemberModal`/`InicioPage`, no con esta pantalla. Conectarlo implica el módulo Equipo completo y es un ticket aparte.

**Shapes reales confirmados contra el backend antes de escribir el service** (no asumidos del diseño original):
- `GET /permisos` → `Array<{ resource, permissions: string[] }>`, sin wrapper de paginación — coincide con el diseño original.
- `GET /roles` → `Array<{ id, name, permissionsCount }>`, array plano.
- `GET /roles/:id/permisos` → `string[]` — **endpoint separado por rol**, no viene incluido en `GET /roles`. Esto cambió el diseño de datos respecto al mock (que tenía un único mapa `Record<roleId, string[]>` en memoria): ahora cada `RoleCard` pide sus propios permisos al expandirse por primera vez, sin ningún estado compartido entre tarjetas.
- `POST /roles` → devuelve `{ id, name }`, **sin** `permissionsCount` (el frontend asume 0 al insertarlo localmente en la lista).
- `PATCH /roles/:id/permisos` → devuelve `string[]` (el set que quedó guardado).

**Detalle técnico:**
- `features/roles-permisos/types/role.ts` (nuevo, reemplaza al `src/types/role.ts` global — ya no lo usaba nada fuera de esta feature) y `features/roles-permisos/services/roles.service.ts` (wrapper fino sobre el mismo `apiRequest` del ticket de login, sin tocarlo).
- `RoleCard` ya no recibe el mapa completo de permisos por props: al expandirse por primera vez pide `GET /roles/:id/permisos` y guarda su propio estado de carga/guardado. Al guardar, la página padre solo actualiza el `permissionsCount` de ESE rol en la lista (`.map()` puntual, nunca un refetch completo de `/roles`) — así, tener otra tarjeta expandida con cambios sin guardar y guardar una no la toca ni la resetea (se verificó con dos tarjetas expandidas a la vez).
- `lib/permissions.ts`: se sacó el catálogo mock (`CRUD_RESOURCES`/`CRUD_ACTIONS`/`PERMISSION_CATALOG`/`crudPermission`) — el catálogo real viene siempre de `/permisos`. Quedaron `resourceLabel()`/`actionLabel()` (antes `Record` tipados) como funciones con fallback al string crudo, porque ya no hay garantía en compile-time de qué recursos existen.
- `useApp.tsx`: se sacaron `roles`, `rolePermissions`, `addRole`, `updateRolePermissions` de `AppState` sin dejar rastro — nada más los consumía.
- El gate `can("manageRoles")` no necesitó ningún cambio: ya delegaba en el `useAuth()` real desde el ticket de login (`can: canReal` en `useApp.tsx`). Este ticket solo conectó los *datos* de la pantalla, el *acceso* a la pantalla ya era real.

**Hueco funcional conocido, no solo alcance recortado:** hasta que exista una pantalla de asignación de roles a usuarios (probablemente en Equipo, ver `POST/DELETE /equipo/:userId/roles/:roleId` que el backend ya expone pero el frontend no consume), **cualquier rol nuevo creado desde esta pantalla no se le puede asignar a nadie desde el frontend**. Sirve para definir el set de permisos de un rol, pero conectarlo a una persona real hoy solo se puede hacer pegándole directo a la API (como se hizo a mano para Sudo→Ana en el ticket anterior). No es una limitación de diseño a propósito, es una pieza que todavía no se construyó.

**Verificado con navegador real** (Playwright, con capturas): login como Martín (Admin) mostrando las 4 tarjetas reales — Admin, Líder, Músico y Sudo con sus 28 permisos, **sin ningún caso especial en el código** para mostrar Sudo (el diseño por catálogo genérico funcionó tal cual). Rol nuevo creado ("Prueba QA") mostrando "0 permisos" en la tarjeta colapsada antes de expandirla, no un texto raro. Edité los permisos de Líder (tildé `estadisticas:write`), guardé, **refresqué la página entera**, y confirmé que el cambio persistió contra la base real (16 → 17 permisos, checkbox tildado tras el reload) — no era solo un cambio visual que se perdía al recargar. Revertí ese cambio de prueba y borré el rol "Prueba QA" al final para no dejar basura en la base. Login como Joaquín (Músico) confirmando que sigue viendo "Sección restringida", ahora con el gate real de punta a punta.

**Sin verificar:** el borrado de un rol desde la UI (no hay botón de eliminar en el diseño de esta pantalla; se probó el `DELETE` directo contra la API solo para la limpieza post-test, no a través de la pantalla). Tampoco se probó qué pasa si dos personas editan el mismo rol al mismo tiempo desde dos sesiones distintas (último `PATCH` gana, sin ningún aviso de conflicto).

---

## 2026-09-24 — Rol Sudo (soporte técnico) con todos los permisos del catálogo

**Motivo de negocio:** Pablo pidió un cuarto rol, "Sudo", con absolutamente todos los permisos del catálogo sin excepción (incluido `rol:write`), asignado a un usuario existente del seed — no uno nuevo, para no caer en el fallback a `members[0]` del frontend que ya habíamos identificado como limitación conocida.

**Alcance:** exclusivamente seed y migración de datos. No se conectó la pantalla de Roles y Permisos (sigue mockeada) ni se tocó nada del flujo de login/`AuthGate`.

**A quién se le asignó y por qué:** a **Ana Ferrari** (`ana@cielosabiertos.org`, hoy Sonido/Consola), reemplazando su rol Músico — no a Martín (queda como único ejemplo de Admin) ni a Joaquín (a pedido explícito, se sigue usando como referencia de "Músico sin permisos"). Líder queda con sus dos ejemplos intactos (Sofía, Lucía) y Músico con cuatro (Joaquín, Camila, Nicolás, Diego) — ningún rol original quedó sin representante en el seed.

**Decisiones explícitas, con su razón:**
- **Sudo reemplaza a Músico en Ana, no convive con él.** Matemáticamente daba lo mismo para la propiedad de inmunidad buscada (`getPermissionsForUser` calcula la unión de permisos de todos los roles de un usuario, así que tener Sudo alcanza para ser inmune a que alguien le achique los permisos a otro rol, sin importar si además tiene ese otro rol o no) — se eligió reemplazar por claridad semántica: evita la pregunta de "por qué este usuario tiene dos roles a la vez".
- **El catálogo de Sudo es un snapshot fijo (28 permisos hardcodeados en la migración), no dinámico.** Se decidió así por consistencia con Admin/Líder/Músico, que ya funcionan igual — ninguno de los roles del sistema es "dinámico", todos son filas fijas en `role_permissions`. La alternativa (un caso especial en `AuthorizationService` que detecte el rol por nombre y le devuelva todo el catálogo en runtime) se descartó por frágil: se rompería si alguien renombra el rol "Sudo" desde la pantalla de administración. **Consecuencia a recordar:** si el catálogo de permisos crece (nuevo recurso), Sudo NO se entera solo — hace falta una migración nueva que le otorgue el permiso nuevo, tal como ya pasó cuando se agregó el recurso `rol` y hubo que dárselo a mano a Admin/Líder/Músico.
- **La migración funciona tanto contra la base ya poblada de este entorno como contra una instalación nueva desde cero**, porque se tocaron dos lugares a propósito: la migración (`AddSudoRole`) hace el swap de Ana si ya existe como usuario, y `run-seed.ts` también sabe darle "sudo" a Ana desde el arranque — sin este segundo cambio, alguien que clonara el repo y corriera el seed por primera vez habría terminado con Ana como Músico normal, no Sudo.

**Verificado con login real:** login contra `POST /auth/login` con `ana@cielosabiertos.org`, confirmando por API que su token trae `roles: ["Sudo"]` y 28 permisos (incluido `rol:write`). En el navegador: acceso sin restricción a `/roles-permisos` (no aparece "Sección restringida"), y visibles los botones "Agregar miembro" (Equipo), "Subir canción" (Escuchar) y "Nuevo setlist" (Setlists) — los mismos gates que antes solo dejaban pasar a Admin.

**Aclaración para no confundir en capturas futuras:** el badge del Sidebar y la lista de roles que muestra la propia pantalla de Roles y Permisos siguen viniendo del mock `useApp` (desconectado del backend real, documentado como deuda desde el ticket de login) — por eso Ana sigue apareciendo con el badge "Músico" ahí y "Sudo" no aparece en esa lista de 3 roles mockeados, aunque su sesión real tenga los 28 permisos. El gate de acceso (`can("manageRoles")`) sí usa el permiso real y la dejó entrar correctamente.

**Sin verificar:** el comportamiento de la migración `down()` (rollback) no se ejecutó, solo se revisó por lectura de código.

---

## 2026-09-23 — Rediseño visual de LoginPage + fix de un bug real en el interceptor de 401 (frontend)

**Motivo de negocio:** la pantalla de login ya funcionaba (ticket anterior), pero Pablo pidió verificar si tenía el mismo nivel de cuidado visual que el resto de la app — es lo primero que ve cualquiera que entra al sistema — y, si no, rediseñarla sin tocar la lógica de auth ya probada.

**Alcance:** exclusivamente la capa visual de `LoginPage.tsx`, más una excepción mínima y explícitamente autorizada en `api-client.ts` (ver bug abajo). No se tocó `auth-store.ts` ni `AuthGate`, ni se agregó funcionalidad nueva (recuperar contraseña, "recordarme", registro).

**Estado real encontrado antes de tocar nada** (verificado con capturas de pantalla y no asumido): la pantalla ya usaba los tokens reales de `styles.css` — no era un formulario genérico sin estilo — pero le faltaba la jerarquía visual del resto de la app (wordmark chico, sin el gradiente dorado que "Abiertos" tiene en Inicio, sin el fondo `gradient-sky` del hero).

**Bug real encontrado de paso (no cosmético):** al probar el flujo de contraseña incorrecta, la página recargaba por completo (confirmado viendo dos eventos "`[vite] connecting`" en la consola del browser durante un mismo intento) y el mensaje de error nunca llegaba a pintarse. Causa: el interceptor global de 401 en `api-client.ts` — pensado para detectar que una sesión activa expiró y forzar `logout()` + redirect — se disparaba también ante un 401 de la propia llamada a `POST /auth/login`, que no es una sesión expirada sino simplemente una contraseña incorrecta. El `catch` de `LoginPage` nunca llegaba a ejecutarse porque el `window.location.assign("/login")` ya estaba en curso.

**Detalle técnico:**
- `src/lib/api-client.ts`: excepción de una línea — un 401 con `path === "/auth/login"` ya no dispara `onUnauthorized()`. Se pidió confirmación explícita antes de tocar este archivo (estaba marcado fuera de alcance en el ticket anterior) porque no había forma de cumplir "estados de error claros" sin esta corrección.
- `src/features/auth/pages/LoginPage.tsx`: wordmark con el mismo tratamiento `text-gradient-gold` que usa "Abiertos" en `InicioPage`, fondo con `gradient-sky` sutil (mismo gradiente del hero de Inicio, en baja opacidad), `glow` en el ícono, validación propia de campos vacíos vía `noValidate` (en vez del tooltip nativo del browser, inconsistente entre navegadores), y el mensaje de error real del backend en una caja con ícono y borde en vez de un párrafo de texto suelto.

**Verificado con navegador real** (Playwright, con capturas — no solo lectura de código): desktop (1440px) y mobile (390px, viewport tipo iPhone) del estado limpio; contraseña incorrecta mostrando el mensaje real del backend ("Credenciales inválidas") sin ningún reload (0 reloads detectados) y sin salir de `/login`, en ambos tamaños de pantalla; campos vacíos mostrando el mensaje propio sin navegar; estado de loading confirmado con la respuesta de login demorada artificialmente (botón `disabled`, texto "Ingresando…", sin doble submit al clickear de nuevo mientras carga) y el login terminando bien después.

**Sin verificar:** accesibilidad con lector de pantalla (no se probó con uno real, solo se agregaron `label`/`htmlFor`/`role="alert"` razonables). Tampoco se probó en un browser real de gama baja/con red lenta real (solo se simuló latencia con Playwright).

---

## 2026-09-23 — Extensión de JWT_EXPIRES_IN de 15m a 8h (backend)

**Motivo de negocio:** con expiración de 15 minutos y sin endpoint de refresh, cualquier ensayo o servicio real (más largo que 15 minutos) iba a deslogueaar a los músicos en medio del uso. Pablo pidió extenderlo a 8hs — para una app interna de equipo de iglesia, el riesgo de seguridad de una sesión más larga es aceptable.

**Alcance:** exclusivamente el valor de expiración del JWT y su configuración asociada. No se implementó un endpoint de refresh (queda para más adelante si hace falta) y no se tocó nada del flujo de `AuthGate`/login ya commiteado.

**Investigación previa a tocar el valor** (pedida explícitamente antes de asumir nada):
- Se encontraron **4 lugares** con el valor `15m`, no uno: `.env` (real, no versionado), `.env.example`, el fallback en `src/config/configuration.ts`, y el default de Joi en `src/config/env.validation.ts`. Se actualizaron los 4 juntos para que no queden desincronizados.
- **No hay ningún test en el proyecto** (confirmado con `find`: cero `.spec.ts`/`.test.ts`, y los configs `vitest.*.config.ts` que `package.json` referencia ni siquiera existen) — nada dependía del valor corto.
- **Los tokens ya emitidos no se ven afectados**: el `exp` se calcula y graba dentro del JWT en el momento de firmarlo (`jwtService.signAsync`), no se recalcula después. Quien esté logueado con un token viejo sigue expirando a los 15 minutos originales; solo los tokens nuevos (emitidos tras reiniciar con la variable nueva) duran 8hs.

**Verificado con login real:** reinicio del backend con `JWT_EXPIRES_IN=8h`, login real contra `martin@cielosabiertos.org`, y decodificación manual del JWT resultante — `iat` y `exp` con exactamente 8 horas de diferencia, no 15 minutos.

**Sin verificar:** comportamiento real durante un servicio de 8+ horas (no se simuló ese caso límite).

---

## 2026-09-23 — Login real en el frontend (reemplazo del selector de rol mock)

**Motivo de negocio:** el frontend elegía "quién sos" con un `<select>` de rol mockeado en el Sidebar. Pablo pidió reemplazarlo por completo por un login real contra `POST /auth/login` + `GET /auth/me`, sin que conviva ningún "modo demo sin sesión" — si no hay sesión válida, se va a `/login`, sin excepción.

**Alcance:** exclusivamente identidad/autenticación del usuario logueado (JWT en `localStorage`, guard de ruta, `can()` real). El resto de los módulos (canciones, setlists, favoritos, anotaciones, la propia pantalla de Roles y Permisos) siguen consumiendo datos 100% mockeados — no se conectó ninguna entidad de negocio en este ticket.

**Detalle técnico:**

- `src/lib/api-client.ts`: cliente HTTP único. El doc de patrones asume un endpoint de refresh de token que este backend no tiene (solo `/auth/login` y `/auth/me`, `JWT_EXPIRES_IN` fijo en 15 min). El singleton que el doc pide para evitar refreshes paralelos se reinterpretó como un singleton de **logout**: ante un 401, todos los requests en vuelo esperan la misma promesa de "cerrar sesión y redirigir", en vez de disparar cada uno la suya.
- `src/core/auth/auth-store.ts`: store plano (no React Context) para que el guard de ruta pueda leerlo fuera del árbol de componentes. Expone `login`, `logout` (limpia `localStorage` Y redirige a `/login` en el mismo paso, sin dejar un estado intermedio inconsistente) y `can(action)`, que traduce los nombres de acción que ya usaba la UI mockeada (`manageTeam`, `editSongs`, `createSetlist`, `viewStats`, `manageRoles`) a un permiso real del catálogo (`equipo:write`, `cancion:write`, `setlist:write`, `estadisticas:read`, `rol:write` respectivamente) — mapeo verificado contra los 3 roles originales antes de aplicarlo, mismo resultado que el mock para esos tres casos.
- `src/core/guards/AuthGate.tsx`: reemplaza al `beforeLoad` que se había planteado originalmente. Con el JWT en `localStorage` (no en cookie), el servidor no puede saber si hay sesión durante el render SSR de TanStack Start — un `beforeLoad` quedaría ciego ahí. En su lugar, este componente gatea el render según el estado real del store (que arranca en `"loading"` tanto en servidor como en la primera pasada del cliente) y solo muestra el layout una vez que el cliente confirmó la sesión contra `/auth/me`; mientras tanto (o si no hay sesión, fuera de `/login`), muestra un spinner en vez del contenido ya armado.
- `src/hooks/useApp.tsx`: se sacaron `setCurrentUserId`/`setRole` (selector mock, reemplazo total). `currentUser` — que todavía usan `NewSetlistModal`, `SetlistCard/Detail` y `canEditAnnotation` para autoría mockeada — ahora se **deriva matcheando el email real logueado contra el array mock `members`** (confirmado que son las mismas 8 personas que el seed real del backend). `can()` deja de mirar un `role` mock y delega en el store real.

**Deuda conocida, documentada a pedido explícito (no se resuelve en este ticket):** `canEditAnnotation` (en `useApp.tsx`) sigue comparando contra `currentUser.role === "admin" || "lider"` — el rol mock, estático — en vez del permiso real `anotacion:update`/`anotacion:delete` que `AnnotationsService` ya usa en el backend desde el ticket de Roles y Permisos. Como el rol real ahora es editable en runtime (un admin puede sacarle todos los permisos a "Líder" desde la pantalla de Roles y Permisos), estas dos fuentes pueden discrepar: alguien podría ver el candado de "no podés editar" en el mock cuando el backend real lo dejaría, o viceversa. No se corrigió porque las anotaciones siguen siendo un módulo 100% mockeado, fuera del alcance de este ticket — queda para cuando se conecte ese módulo al backend real.

**Verificado con navegador real** (Playwright, no solo curl/`tsc`): sin sesión, `/` termina en `/login`; login real con `martin@cielosabiertos.org` (Admin) muestra su nombre/rol real en el Sidebar, acceso a "Roles y Permisos" sin restricción, y los botones "Agregar miembro"/"Subir canción" visibles; logout limpia la sesión y vuelve a `/login`; login con `joaquin@cielosabiertos.org` (Músico) muestra "Sección restringida" en Roles y Permisos y oculta esos mismos botones — confirmado con capturas de pantalla, no solo por presencia de texto en el HTML.

**Sin verificar:** qué pasa si el token expira en medio de una sesión activa (no hay refresh; con `JWT_EXPIRES_IN=15m` esto va a pasar en uso real durante un ensayo largo) — no se simuló ese escenario. Tampoco se probó el caso de un usuario real sin contraparte en el mock `members` (cae a `members[0]` por diseño, pero no se ejecutó ese caso concreto).

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
